package com.sanem.model.entity;

import com.sanem.model.enums.LegalBasis;

import java.time.LocalDateTime;

/** Titular de dados sem conta de acesso (doador ou beneficiário). */
public interface PersonalDataSubject {
    LegalBasis getLegalBasis();
    void setLegalBasis(LegalBasis legalBasis);
    void setPrivacyPurpose(String privacyPurpose);
    boolean isPrivacyConsent();
    void setPrivacyConsent(boolean privacyConsent);
    void setPrivacyConsentAt(LocalDateTime privacyConsentAt);
    void setPrivacyConsentVersion(String privacyConsentVersion);
    LocalDateTime getAnonymizedAt();
    void setAnonymizedAt(LocalDateTime anonymizedAt);
}
