package com.sanem.model.dto;

import com.sanem.model.enums.ConservationState;

public record ItemDonatedDTO(
        Long itemDonatedId,
        ItemDTO item,
        Integer quantity,
        CategoryDTO category,
        ConservationState conservationState
) {
}
