package com.sanem.model.dto;

import com.sanem.validation.ValidCpfCnpj;
import com.sanem.model.enums.LegalBasis;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DonorFormDTO(
        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 3, max = 255, message = "Nome deve ter entre 3 e 255 caracteres")
        String name,
        
        @ValidCpfCnpj(message = "CPF/CNPJ inválido")
        String cpfCnpj,
        
        @NotBlank(message = "Contato é obrigatório")
        String contact,

        @Email(message = "E-mail deve ter um formato válido")
        String email,

        @NotNull(message = "A base legal do tratamento de dados é obrigatória")
        LegalBasis legalBasis,

        @Size(max = 255, message = "A finalidade deve ter no máximo 255 caracteres")
        String privacyPurpose,

        Boolean privacyConsent
) {
}
