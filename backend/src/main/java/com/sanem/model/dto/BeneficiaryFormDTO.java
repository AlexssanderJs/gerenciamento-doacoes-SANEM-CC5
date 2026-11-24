package com.sanem.model.dto;

import com.sanem.validation.ValidCpf;
import com.sanem.model.enums.BeneficiaryStatus;
import com.sanem.model.enums.LegalBasis;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record BeneficiaryFormDTO(
        @NotBlank(message = "Nome completo é obrigatório")
        @Size(min = 3, max = 255, message = "Nome completo deve ter entre 3 e 255 caracteres")
        String fullName,
        
        @ValidCpf(message = "CPF inválido")
        String cpf,
        
        @NotBlank(message = "Telefone é obrigatório")
        @Pattern(regexp = "^[0-9]{10,11}$", message = "Telefone deve conter 10 ou 11 dígitos numéricos")
        String phone,
        
        String socioeconomicData,
        BeneficiaryStatus beneficiaryStatus,
        
        Integer withdrawalLimit,

        @NotNull(message = "A base legal do tratamento de dados é obrigatória")
        LegalBasis legalBasis,

        @Size(max = 255, message = "A finalidade deve ter no máximo 255 caracteres")
        String privacyPurpose,

        Boolean privacyConsent
) {
}
