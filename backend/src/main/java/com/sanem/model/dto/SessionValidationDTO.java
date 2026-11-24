package com.sanem.model.dto;

public record SessionValidationDTO(
    boolean valid,
    boolean privacyConsent,
    String privacyConsentVersion,
    String currentPrivacyPolicyVersion,
    String role
) {}
