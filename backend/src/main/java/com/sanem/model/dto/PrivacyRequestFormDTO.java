package com.sanem.model.dto;

import com.sanem.model.enums.PrivacyRequestType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PrivacyRequestFormDTO(
        @NotNull(message = "Selecione o tipo de solicitação")
        PrivacyRequestType requestType,
        @NotBlank(message = "Descreva sua solicitação")
        @Size(max = 2000, message = "A descrição deve ter no máximo 2.000 caracteres")
        String description
) {}
