package com.sanem.model.dto;

import com.sanem.model.enums.ConservationState;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Date;
import java.util.List;

public record DonationFormDTO(
        @NotNull(message = "A data da doação é obrigatória")
        Date donationDate,

        // Mantido para compatibilidade. O servidor usa o usuário autenticado.
        Long attendantUserId,

        @NotNull(message = "O doador é obrigatório")
        Long donorId,

        @NotEmpty(message = "A doação deve conter pelo menos um item")
        List<@Valid DonationItemRequestDTO> items
) {
    public record DonationItemRequestDTO(
            Long itemId,
            @NotNull(message = "A quantidade é obrigatória")
            @Min(value = 1, message = "A quantidade deve ser maior que zero")
            Integer quantity,
            String newItemName,
            @NotNull(message = "A categoria é obrigatória")
            Long categoryId,
            @NotNull(message = "O estado de conservação é obrigatório")
            ConservationState conservationState
    ) {}
}
