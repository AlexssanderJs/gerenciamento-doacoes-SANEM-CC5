package com.sanem.model.entity;

import com.sanem.model.enums.LegalBasis;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "donor")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Donor implements SoftDeletable, PersonalDataSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "donor_id")
    private Long donorId;

    @NotNull
    @Column(name = "name")
    private String name;

    @Column(name = "cpf_cnpj", unique = true)
    private String cpfCnpj;

    @Column(name = "contact")
    private String contact;

    @Column(name = "email", nullable = true)
    private String email;


    @Enumerated(EnumType.STRING)
    @Column(name = "legal_basis", length = 30)
    private LegalBasis legalBasis;

    @Column(name = "privacy_purpose")
    private String privacyPurpose;

    @Column(name = "privacy_consent", nullable = false)
    private boolean privacyConsent;

    @Column(name = "privacy_consent_at")
    private LocalDateTime privacyConsentAt;

    @Column(name = "privacy_consent_version", length = 50)
    private String privacyConsentVersion;

    @Column(name = "anonymized_at")
    private LocalDateTime anonymizedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

}
