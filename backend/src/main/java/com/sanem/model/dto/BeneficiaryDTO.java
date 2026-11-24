package com.sanem.model.dto;

import com.sanem.model.enums.BeneficiaryStatus;
import com.sanem.model.dto.AppUserDTO;
import com.sanem.model.enums.LegalBasis;

import java.time.LocalDateTime;

public record BeneficiaryDTO (
        Long beneficiaryId,
        String fullName,
        String cpf,
        String phone,
        String socioeconomicData,
        BeneficiaryStatus beneficiaryStatus,
        AppUserDTO approverId,
        Integer withdrawalLimit,
        Integer currentWithdrawalsThisMonth,
        Integer remainingWithdrawals,
        LegalBasis legalBasis,
        String privacyPurpose,
        boolean privacyConsent,
        LocalDateTime privacyConsentAt,
        LocalDateTime anonymizedAt
){
}
