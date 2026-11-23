package com.sanem.mapper;

import com.sanem.repository.CategoryRepository;
import com.sanem.model.dto.ItemFormDTO;
import com.sanem.model.entity.Item;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ItemCreateMapper {

    private final CategoryRepository categoryRepository;

    public Item convert(ItemFormDTO itemFormDTO){
        Item item = new Item();
        item.setDescription(itemFormDTO.description());
        item.setStockQuantity(0L); 
        String tag = itemFormDTO.tagCode();
        if (tag != null && tag.trim().isEmpty()) {
            tag = null;
        }
        item.setTagCode(tag);
        item.setMinimumStock(itemFormDTO.minimumStock());

        if (itemFormDTO.categoryId() != null) {
            categoryRepository.findById(itemFormDTO.categoryId())
                    .ifPresent(item::setCategory);
        }

        item.setSize(itemFormDTO.size());
        item.setConservationState(itemFormDTO.conservationState());
        item.setGender(itemFormDTO.gender());
        item.setType(itemFormDTO.type());
        item.setConditionStatus(itemFormDTO.conditionStatus());
        item.setLocation(itemFormDTO.location());

        return item;
    }
}
