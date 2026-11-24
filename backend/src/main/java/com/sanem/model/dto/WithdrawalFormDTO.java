package com.sanem.model.dto;

import java.util.Date;
import java.util.List;

public record WithdrawalFormDTO(
        Date withdrawalDate,
        Long beneficiaryId,
        // Campo legado mantido para compatibilidade; o backend usa o usuário autenticado.\n        Long attendantUserId,
        List<WithdrawalItemDTO> items
) {
    public record WithdrawalItemDTO(
            Long itemId,
            Integer quantity
    ) {}
}
