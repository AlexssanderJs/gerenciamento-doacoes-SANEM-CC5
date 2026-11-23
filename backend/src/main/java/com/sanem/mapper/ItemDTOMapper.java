package com.sanem.mapper;

import com.sanem.model.dto.CategoryDTO;
import com.sanem.model.dto.ItemDTO;
import com.sanem.model.entity.Item;
import org.springframework.stereotype.Service;

@Service
public class ItemDTOMapper {

    public ItemDTO convert(Item item){
        if(item == null) return null;
        CategoryDTO categoryDTO = null;
        if (item.getCategory() != null) {
            categoryDTO = new CategoryDTO(
                    item.getCategory().getCategoryId(),
                    item.getCategory().getName()
            );
        }
        return new ItemDTO(
                item.getItemId(),
                item.getDescription(),
                item.getStockQuantity(),
                item.getTagCode(),
                item.getMinimumStock(),
                item.isLowStock(),
                categoryDTO,
                item.getSize(),
                item.getConservationState(),
                item.getGender(),
                item.getType(),
                item.getConditionStatus(),
                item.getLocation()
        );
    }
}
