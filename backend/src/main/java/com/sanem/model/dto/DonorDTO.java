package com.sanem.model.dto;

import com.sanem.model.enums.LegalBasis;

import java.time.LocalDateTime;

public record DonorDTO(
        Long donorId,
        String name,
        String cpfCnpj,
        String contact,
        String email,
        LegalBasis legalBasis,
        String privacyPurpose,
        boolean privacyConsent,
        LocalDateTime privacyConsentAt,
        LocalDateTime anonymizedAt
) {
}
