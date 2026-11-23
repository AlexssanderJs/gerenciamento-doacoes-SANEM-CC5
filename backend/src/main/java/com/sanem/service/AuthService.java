package com.sanem.service;

import com.sanem.model.dto.LoginRequestDTO;
import com.sanem.model.dto.LoginResponseDTO;
import com.sanem.model.entity.AppUser;
import com.sanem.model.enums.Status;
import com.sanem.repository.AppUserRepository;
import com.sanem.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final String PRIVACY_POLICY_VERSION = "SANEM-PRIVACY-1.0";
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponseDTO authenticate(LoginRequestDTO loginRequest) {
        String identifier = loginRequest.getLogin() != null ? loginRequest.getLogin().trim() : "";
        AppUser user = appUserRepository.findByLoginAndDeletedAtIsNull(identifier)
                .or(() -> appUserRepository.findByLoginIgnoreCaseAndDeletedAtIsNull(identifier))
                .or(() -> appUserRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(identifier))
                .orElseThrow(() -> new RuntimeException("Usuário ou senha incorretos"));
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Usuário ou senha incorretos");
        }
        if (user.getStatus() != Status.ACTIVE) throw new RuntimeException("Usuário inativo");

        String token = jwtService.generateToken(user.getLogin());
        return new LoginResponseDTO(token, user.getName(), user.getEmail(),
                user.getProfile().getName(), user.getUserId(),
                user.isPrivacyConsent(), user.getPrivacyConsentVersion());
    }

    public AppUser getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Usuário não autenticado");
        }
        return appUserRepository.findByLoginAndDeletedAtIsNull(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    @Transactional
    public void acceptPrivacyConsent() {
        AppUser user = getCurrentUser();
        user.setPrivacyConsent(true);
        user.setPrivacyConsentAt(LocalDateTime.now());
        user.setPrivacyConsentRevokedAt(null);
        user.setPrivacyConsentVersion(PRIVACY_POLICY_VERSION);
        appUserRepository.save(user);
    }

    @Transactional
    public void revokePrivacyConsent() {
        AppUser user = getCurrentUser();
        user.setPrivacyConsent(false);
        user.setPrivacyConsentRevokedAt(LocalDateTime.now());
        appUserRepository.save(user);
    }

    public boolean validateToken(String token) {
        try {
            String login = jwtService.extractLogin(token);
            return appUserRepository.findByLoginAndDeletedAtIsNull(login)
                    .filter(user -> user.getStatus() == Status.ACTIVE).isPresent();
        } catch (Exception e) {
            return false;
        }
    }
}
