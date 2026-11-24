package com.sanem.security;

import com.sanem.model.entity.AppUser;
import com.sanem.model.enums.Status;
import com.sanem.repository.AppUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final AppUserRepository appUserRepository;

    @Value("${sanem.privacy.policy-version:SANEM-PRIVACY-1.1}")
    private String currentPrivacyPolicyVersion = "SANEM-PRIVACY-1.1";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String login = jwtService.extractLogin(authHeader.substring(7));
                AppUser user = appUserRepository.findByLoginAndDeletedAtIsNull(login).orElse(null);
                if (user != null && user.getStatus() == Status.ACTIVE) {
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    boolean currentConsent = user.isPrivacyConsent()
                        && currentPrivacyPolicyVersion.equals(user.getPrivacyConsentVersion());
                    if (currentConsent) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_PRIVACY_ACCEPTED"));
                        if (user.getProfile() != null && user.getProfile().getDeletedAt() == null) {
                            Optional<String> role = ProfileRoleMapper.toAuthority(user.getProfile().getName());
                            role.ifPresent(value -> authorities.add(new SimpleGrantedAuthority(value)));
                        }
                    }
                    var authentication = new UsernamePasswordAuthenticationToken(login, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    SecurityContextHolder.clearContext();
                }
            } catch (Exception ignored) {
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }
}
