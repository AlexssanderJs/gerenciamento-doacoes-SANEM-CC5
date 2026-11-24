package com.sanem.model.dto;

import com.sanem.model.dto.CategoryDTO;

public record ItemDTO(
        Long itemId,
        String description,
        Long stockQuantity,
        String tagCode,
        Long minimumStock,
        boolean lowStock,
        CategoryDTO category,
        String size,
        String conservationState,
        String gender,
        String type,
        String conditionStatus,
        String location
) {
}
