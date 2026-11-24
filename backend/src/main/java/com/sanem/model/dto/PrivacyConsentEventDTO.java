package com.sanem.model.dto;

import java.time.LocalDateTime;

public record PrivacyConsentEventDTO(
        String eventType,
        String policyVersion,
        LocalDateTime occurredAt,
        String ipAddress,
        String userAgent
) {}
