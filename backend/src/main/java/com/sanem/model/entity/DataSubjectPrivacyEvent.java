package com.sanem.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "data_subject_privacy_event")
@Getter
@Setter
@NoArgsConstructor
public class DataSubjectPrivacyEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "subject_type", nullable = false, length = 20)
    private String subjectType;

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Column(name = "event_type", nullable = false, length = 20)
    private String eventType;

    @Column(name = "legal_basis", length = 30)
    private String legalBasis;

    @Column(name = "consent_given", nullable = false)
    private boolean consentGiven;

    @Column(name = "policy_version", length = 50)
    private String policyVersion;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    @Column(name = "recorded_by_user_id")
    private Long recordedByUserId;
}
