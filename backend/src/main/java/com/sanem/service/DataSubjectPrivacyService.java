package com.sanem.service;

import com.sanem.model.dto.DataSubjectPrivacyEventDTO;
import com.sanem.model.entity.AppUser;
import com.sanem.model.entity.DataSubjectPrivacyEvent;
import com.sanem.model.entity.PersonalDataSubject;
import com.sanem.model.enums.LegalBasis;
import com.sanem.repository.DataSubjectPrivacyEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/** Regras de LGPD compartilhadas por doadores e beneficiários (RNF04). */
@Service
@RequiredArgsConstructor
public class DataSubjectPrivacyService {
    public static final String DONOR = "DONOR";
    public static final String BENEFICIARY = "BENEFICIARY";

    private final DataSubjectPrivacyEventRepository eventRepository;
    private final AuthService authService;

    @Value("${sanem.privacy.policy-version:SANEM-PRIVACY-1.1}")
    private String policyVersion = "SANEM-PRIVACY-1.1";

    /**
     * Aplica base legal, finalidade e consentimento ao titular. A base legal é obrigatória;
     * quando for CONSENTIMENTO, o aceite do titular precisa estar marcado.
     */
    public void apply(PersonalDataSubject subject, LegalBasis legalBasis, String purpose, Boolean consent) {
        if (subject.getAnonymizedAt() != null) {
            throw new IllegalArgumentException("Registro anonimizado não pode ser alterado.");
        }
        if (legalBasis == null) {
            throw new IllegalArgumentException("A base legal do tratamento de dados é obrigatória.");
        }
        boolean consentGiven = Boolean.TRUE.equals(consent);
        if (legalBasis == LegalBasis.CONSENT && !consentGiven) {
            throw new IllegalArgumentException(
                    "O consentimento do titular é obrigatório quando a base legal é consentimento.");
        }
        boolean wasConsenting = subject.isPrivacyConsent();
        subject.setLegalBasis(legalBasis);
        subject.setPrivacyPurpose(purpose == null || purpose.isBlank() ? null : purpose.trim());
        subject.setPrivacyConsent(consentGiven);
        if (consentGiven) {
            if (!wasConsenting) {
                subject.setPrivacyConsentAt(LocalDateTime.now());
            }
            subject.setPrivacyConsentVersion(policyVersion);
        } else {
            subject.setPrivacyConsentAt(null);
            subject.setPrivacyConsentVersion(null);
        }
    }

    public void recordEvent(String subjectType, Long subjectId, String eventType, PersonalDataSubject subject) {
        DataSubjectPrivacyEvent event = new DataSubjectPrivacyEvent();
        event.setSubjectType(subjectType);
        event.setSubjectId(subjectId);
        event.setEventType(eventType);
        event.setLegalBasis(subject.getLegalBasis() == null ? null : subject.getLegalBasis().name());
        event.setConsentGiven(subject.isPrivacyConsent());
        event.setPolicyVersion(policyVersion);
        event.setOccurredAt(LocalDateTime.now());
        AppUser user = authService.getCurrentUser();
        event.setRecordedByUserId(user.getUserId());
        eventRepository.save(event);
    }

    public void markAnonymized(PersonalDataSubject subject) {
        subject.setPrivacyConsent(false);
        subject.setPrivacyConsentAt(null);
        subject.setPrivacyConsentVersion(null);
        subject.setPrivacyPurpose(null);
        subject.setAnonymizedAt(LocalDateTime.now());
    }

    public List<DataSubjectPrivacyEventDTO> history(String subjectType, Long subjectId) {
        return eventRepository.findBySubjectTypeAndSubjectIdOrderByOccurredAtDesc(subjectType, subjectId)
                .stream()
                .map(e -> new DataSubjectPrivacyEventDTO(
                        e.getEventType(), e.getLegalBasis(), e.isConsentGiven(),
                        e.getPolicyVersion(), e.getOccurredAt()))
                .toList();
    }
}
