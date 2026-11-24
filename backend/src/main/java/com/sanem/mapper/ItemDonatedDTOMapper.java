package com.sanem.mapper;

import com.sanem.model.dto.ItemDonatedDTO;
import com.sanem.model.entity.ItemDonated;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ItemDonatedDTOMapper {
    private final ItemDTOMapper itemDTOMapper;
    private final CategoryDTOMapper categoryDTOMapper;

    public ItemDonatedDTO convert(ItemDonated itemDonated) {
        if (itemDonated == null) return null;

        return new ItemDonatedDTO(
                itemDonated.getItemDonatedId(),
                itemDTOMapper.convert(itemDonated.getItem()),
                itemDonated.getQuantity(),
                categoryDTOMapper.convert(itemDonated.getCategory()),
                itemDonated.getConservationState()
        );
    }
}
