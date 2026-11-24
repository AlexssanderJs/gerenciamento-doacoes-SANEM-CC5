package com.sanem.service;

import com.sanem.model.dto.LoginRequestDTO;
import com.sanem.model.dto.LoginResponseDTO;
import com.sanem.model.dto.PrivacyConsentEventDTO;
import com.sanem.model.dto.PrivacyDataExportDTO;
import com.sanem.model.dto.SessionValidationDTO;
import com.sanem.model.entity.AppUser;
import com.sanem.model.entity.PrivacyConsentEvent;
import com.sanem.model.enums.Status;
import com.sanem.repository.AppUserRepository;
import com.sanem.repository.PrivacyConsentEventRepository;
import com.sanem.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AppUserRepository appUserRepository;
    private final PrivacyConsentEventRepository privacyConsentEventRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${sanem.privacy.policy-version:SANEM-PRIVACY-1.1}")
    private String privacyPolicyVersion = "SANEM-PRIVACY-1.1";

    public LoginResponseDTO authenticate(LoginRequestDTO loginRequest) {
        String identifier = loginRequest.getLogin() != null ? loginRequest.getLogin().trim() : "";
        AppUser user = appUserRepository.findByLoginAndDeletedAtIsNull(identifier)
                .or(() -> appUserRepository.findByLoginIgnoreCaseAndDeletedAtIsNull(identifier))
                .or(() -> appUserRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(identifier))
                .orElseThrow(() -> new RuntimeException("Usuário ou senha incorretos"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Usuário ou senha incorretos");
        }
        if (user.getStatus() != Status.ACTIVE) {
            throw new RuntimeException("Usuário inativo");
        }

        String token = jwtService.generateToken(user.getLogin());
        return new LoginResponseDTO(
                token,
                user.getName(),
                user.getEmail(),
                user.getProfile().getName(),
                user.getUserId(),
                hasCurrentPrivacyConsent(user),
                user.getPrivacyConsentVersion()
        );
    }

    public AppUser getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName() == null
                || "anonymousUser".equals(authentication.getName())) {
            throw new RuntimeException("Usuário não autenticado");
        }

        return appUserRepository.findByLoginAndDeletedAtIsNull(authentication.getName())
                .filter(user -> user.getStatus() == Status.ACTIVE)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado ou inativo"));
    }

    @Transactional(readOnly = true)
    public PrivacyDataExportDTO getMyPrivacyData() {
        AppUser user = getCurrentUser();
        var history = privacyConsentEventRepository.findByUserUserIdOrderByOccurredAtDesc(user.getUserId())
                .stream()
                .map(event -> new PrivacyConsentEventDTO(
                        event.getEventType(), event.getPolicyVersion(), event.getOccurredAt(),
                        event.getIpAddress(), event.getUserAgent()))
                .toList();

        return new PrivacyDataExportDTO(
                LocalDateTime.now(), user.getUserId(), user.getName(), user.getLogin(), user.getEmail(),
                user.getProfile() == null ? null : user.getProfile().getName(),
                user.getStatus() == null ? null : user.getStatus().name(),
                hasCurrentPrivacyConsent(user), user.getPrivacyConsentVersion(),
                user.getPrivacyConsentAt(), user.getPrivacyConsentRevokedAt(), history
        );
    }

    @Transactional
    public void acceptPrivacyConsent(String ipAddress, String userAgent) {
        AppUser user = getCurrentUser();
        LocalDateTime now = LocalDateTime.now();
        user.setPrivacyConsent(true);
        user.setPrivacyConsentAt(now);
        user.setPrivacyConsentRevokedAt(null);
        user.setPrivacyConsentVersion(privacyPolicyVersion);
        appUserRepository.save(user);
        recordConsentEvent(user, "ACCEPTED", ipAddress, userAgent, now);
    }

    @Transactional
    public void revokePrivacyConsent(String ipAddress, String userAgent) {
        AppUser user = getCurrentUser();
        LocalDateTime now = LocalDateTime.now();
        user.setPrivacyConsent(false);
        user.setPrivacyConsentRevokedAt(now);
        appUserRepository.save(user);
        recordConsentEvent(user, "REVOKED", ipAddress, userAgent, now);
    }

    @Transactional(readOnly = true)
    public SessionValidationDTO validateSession(String token) {
        try {
            String login = jwtService.extractLogin(token);
            AppUser user = appUserRepository.findByLoginAndDeletedAtIsNull(login)
                    .filter(value -> value.getStatus() == Status.ACTIVE)
                    .orElse(null);

            if (user == null) {
                return new SessionValidationDTO(false, false, null, privacyPolicyVersion, null);
            }

            return new SessionValidationDTO(
                    true,
                    hasCurrentPrivacyConsent(user),
                    user.getPrivacyConsentVersion(),
                    privacyPolicyVersion,
                    user.getProfile() == null ? null : user.getProfile().getName()
            );
        } catch (Exception ignored) {
            return new SessionValidationDTO(false, false, null, privacyPolicyVersion, null);
        }
    }

    public boolean validateToken(String token) {
        return validateSession(token).valid();
    }

    public String getCurrentPrivacyPolicyVersion() {
        return privacyPolicyVersion;
    }

    private boolean hasCurrentPrivacyConsent(AppUser user) {
        return user.isPrivacyConsent()
                && privacyPolicyVersion.equals(user.getPrivacyConsentVersion());
    }

    private void recordConsentEvent(
            AppUser user, String eventType, String ipAddress, String userAgent, LocalDateTime occurredAt
    ) {
        PrivacyConsentEvent event = new PrivacyConsentEvent();
        event.setUser(user);
        event.setEventType(eventType);
        event.setPolicyVersion(privacyPolicyVersion);
        event.setOccurredAt(occurredAt);
        event.setIpAddress(limit(ipAddress, 64));
        event.setUserAgent(limit(userAgent, 512));
        privacyConsentEventRepository.save(event);
    }

    private String limit(String value, int maxLength) {
        if (value == null || value.isBlank()) return null;
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
