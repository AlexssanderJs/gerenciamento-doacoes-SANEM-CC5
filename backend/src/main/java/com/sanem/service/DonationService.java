package com.sanem.service;

import com.sanem.exception.EntityNotFoundException;
import com.sanem.service.InventoryService;
import com.sanem.model.enums.TransactionType;
import com.sanem.model.dto.DonationFormDTO;
import com.sanem.model.dto.DonationDTO;
import com.sanem.model.entity.Donation;
import com.sanem.mapper.DonationCreateMapper;
import com.sanem.mapper.DonationDTOMapper;
import com.sanem.repository.DonationRepository;
import com.sanem.specification.DonationSpecification;
import com.sanem.model.entity.Donor;
import com.sanem.model.entity.AppUser;
import com.sanem.model.entity.Item;
import com.sanem.model.entity.Category;
import com.sanem.service.ItemService;
import com.sanem.model.entity.ItemDonated;
import com.sanem.repository.ItemDonatedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification; 
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final DonationRepository donationRepository;
    private final DonationCreateMapper donationCreateMapper;
    private final DonationDTOMapper donationDTOMapper;

    private final ItemService itemService;
    private final CategoryService categoryService; 
    private final ItemDonatedRepository itemDonatedRepository;

    private final InventoryService inventoryService;

    @Transactional
    public DonationDTO create(DonationFormDTO formDTO, Donor donor, AppUser user) {
        Donation donation = donationCreateMapper.convert(formDTO, donor, user);
        Donation donationSalva = donationRepository.save(donation);

        for (DonationFormDTO.DonationItemRequestDTO itemDTO : formDTO.items()) {
            Item item;

            // Cenário em que o item já existe: Busca no banco e aumenta o estoque
            if (itemDTO.itemId() != null) {
                item = itemService.getOrThrowException(itemDTO.itemId());
            } else {
                // Cenário em que o item é novo: Cria a entidade do zero
                item = new Item();
                item.setDescription(itemDTO.newItemName());
                item.setStockQuantity(0L); 
                itemService.save(item);
            }

           inventoryService.processTransaction(
                item, 
                itemDTO.quantity().longValue(), 
                TransactionType.DONATION_IN, 
                donationSalva.getDonationId()
            );

            Category category = categoryService.getOrNull(itemDTO.categoryId());
            if (category == null || category.getDeletedAt() != null) {
                throw new EntityNotFoundException("Category", itemDTO.categoryId());
            }

            ItemDonated itemDonated = new ItemDonated();
            itemDonated.setDonation(donationSalva);
            itemDonated.setItem(item);
            itemDonated.setQuantity(itemDTO.quantity());
            itemDonated.setCategory(category);
            itemDonated.setConservationState(itemDTO.conservationState());
            ItemDonated savedItemDonated = itemDonatedRepository.save(itemDonated);
            donationSalva.getItems().add(savedItemDonated);
        }

        return donationDTOMapper.convert(donationSalva);
    }

    @Transactional
    public void delete(Long id) {
        Donation donation = getOrThrowException(id);

        if (donation.getItems() != null) {
            for(ItemDonated idon : donation.getItems()) {
                Item item = idon.getItem();
                
                inventoryService.processTransaction(
                    item, 
                    idon.getQuantity().longValue(), 
                    TransactionType.DONATION_REVERSAL, 
                    donation.getDonationId()
                );
                
                idon.softDelete();
                itemDonatedRepository.save(idon);
            }
        }

        donation.softDelete();
        donationRepository.save(donation);
    }

    @Transactional(readOnly = true)
    public DonationDTO findById(Long id) {
        return donationRepository.findById(id)
                .map(donationDTOMapper::convert)
                .orElseThrow(() -> new RuntimeException("Doação não encontrada com ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<DonationDTO> findAll() {
        return donationRepository.findAll()
                .stream()
                .map(donationDTOMapper::convert)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DonationDTO> findAllFiltered(
            Date startDate, 
            Date endDate, 
            String donorName, 
            String attendantName, 
            String itemName
    ) {
        if (startDate != null && endDate != null && startDate.after(endDate)) {
            throw new IllegalArgumentException("A data inicial não pode ser posterior à data final.");
        }

        Specification<Donation> spec = Specification.where(DonationSpecification.isNotDeleted())
                .and(DonationSpecification.betweenDates(startDate, endDate))
                .and(DonationSpecification.hasDonorName(donorName))
                .and(DonationSpecification.hasAttendantName(attendantName))
                .and(DonationSpecification.hasItemName(itemName));

        List<Donation> donations = donationRepository.findAll(spec);
        
        return donations.stream()
                .distinct()
                .map(donationDTOMapper::convert)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<DonationDTO> findAllFiltered(
            Pageable pageable,
            Date startDate,
            Date endDate,
            String donorName,
            String attendantName,
            String itemName
    ) {
        if (startDate != null && endDate != null && startDate.after(endDate)) {
            throw new IllegalArgumentException("A data inicial não pode ser posterior à data final.");
        }

        Specification<Donation> spec = Specification.where(DonationSpecification.isNotDeleted())
                .and(DonationSpecification.betweenDates(startDate, endDate))
                .and(DonationSpecification.hasDonorName(donorName))
                .and(DonationSpecification.hasAttendantName(attendantName))
                .and(DonationSpecification.hasItemName(itemName));

        return donationRepository.findAll(spec, pageable).map(donationDTOMapper::convert);
    }

    @Transactional(readOnly = true)
    public List<String> findDistinctAttendantNames() {
        return donationRepository.findDistinctActiveReceiverNames();
    }

    public Donation getOrThrowException(Long id) {
        return donationRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Donation", id)
        );
    }
}
