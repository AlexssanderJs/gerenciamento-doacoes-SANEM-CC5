package com.sanem.model.dto;

import java.time.LocalDateTime;
import java.util.List;

/** Exporta somente os dados da conta autenticada e seu histórico de consentimento. */
public record PrivacyDataExportDTO(
        LocalDateTime generatedAt,
        Long userId,
        String name,
        String login,
        String email,
        String profile,
        String status,
        boolean privacyConsent,
        String privacyConsentVersion,
        LocalDateTime privacyConsentAt,
        LocalDateTime privacyConsentRevokedAt,
        List<PrivacyConsentEventDTO> consentHistory
) {}
