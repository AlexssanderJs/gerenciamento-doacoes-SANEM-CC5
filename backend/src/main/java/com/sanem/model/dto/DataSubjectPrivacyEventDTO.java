package com.sanem.model.dto;

import java.time.LocalDateTime;

public record DataSubjectPrivacyEventDTO(
        String eventType,
        String legalBasis,
        boolean consentGiven,
        String policyVersion,
        LocalDateTime occurredAt
) {
}
