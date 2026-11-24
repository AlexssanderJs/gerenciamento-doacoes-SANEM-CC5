package com.sanem.model.entity;

import com.sanem.model.entity.SoftDeletable;
import com.sanem.model.enums.BeneficiaryStatus;
import com.sanem.model.enums.LegalBasis;
import com.sanem.model.entity.AppUser;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "beneficiary")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Beneficiary implements SoftDeletable, PersonalDataSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "beneficiary_id")
    private Long beneficiaryId;

    @NotBlank
    @Column(name = "full_name")
    private String fullName;

    @NotBlank
    @Column(name = "cpf", unique = true)
    private String cpf;


    @Column(name = "phone")
    private String phone;

    @Column(name = "socioeconomic_data")
    private String socioeconomicData;

    @Convert(converter = BeneficiaryStatus.BeneficiaryStatusConverter.class)
    @Column(name = "beneficiary_status")
    private BeneficiaryStatus beneficiaryStatus;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "approver_user_id")
    private AppUser approverId;

    @Column(name = "withdrawal_limit")
    private Integer withdrawalLimit;


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
