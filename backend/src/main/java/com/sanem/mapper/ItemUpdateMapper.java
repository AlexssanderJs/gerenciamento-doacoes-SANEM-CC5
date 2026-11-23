package com.sanem.mapper;

import com.sanem.repository.CategoryRepository;
import com.sanem.model.dto.ItemFormDTO;
import com.sanem.model.entity.Item;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ItemUpdateMapper {

    private final CategoryRepository categoryRepository;

    public void update(Item item, ItemFormDTO itemFormDTO){
        item.setDescription(itemFormDTO.description());
        String tag = itemFormDTO.tagCode();
        if (tag != null && tag.trim().isEmpty()) {
            tag = null;
        }
        item.setTagCode(tag);
        item.setMinimumStock(itemFormDTO.minimumStock());

        if (itemFormDTO.categoryId() != null) {
            item.setCategory(categoryRepository.findById(itemFormDTO.categoryId()).orElse(null));
        } else {
            item.setCategory(null);
        }

        item.setSize(itemFormDTO.size());
        item.setConservationState(itemFormDTO.conservationState());
        item.setGender(itemFormDTO.gender());
        item.setType(itemFormDTO.type());
        item.setConditionStatus(itemFormDTO.conditionStatus());
        item.setLocation(itemFormDTO.location());
    }
}
