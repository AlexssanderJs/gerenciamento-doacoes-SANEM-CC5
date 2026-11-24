package com.sanem.security;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Optional;

/** Converte nomes de perfil persistidos em autoridades conhecidas pelo Spring Security. */
public final class ProfileRoleMapper {
    private ProfileRoleMapper() {}

    public static Optional<String> toAuthority(String profileName) {
        if (profileName == null || profileName.isBlank()) return Optional.empty();
        String normalized = Normalizer.normalize(profileName.trim(), Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "administrator", "administrador", "admin" -> Optional.of("ROLE_ADMINISTRATOR");
            case "attendant", "atendente", "collaborator", "colaborador" -> Optional.of("ROLE_ATTENDANT");
            case "evaluator", "avaliador" -> Optional.of("ROLE_EVALUATOR");
            default -> Optional.empty();
        };
    }
}
