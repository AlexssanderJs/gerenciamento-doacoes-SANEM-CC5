package com.sanem.model.dto;

import com.sanem.model.enums.PrivacyRequestStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PrivacyRequestUpdateDTO(
        @NotNull(message = "O status é obrigatório")
        PrivacyRequestStatus status,
        @Size(max = 2000, message = "A resposta deve ter no máximo 2.000 caracteres")
        String responseMessage
) {}
