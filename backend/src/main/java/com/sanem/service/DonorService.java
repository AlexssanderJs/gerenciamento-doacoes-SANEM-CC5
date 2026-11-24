package com.sanem.service;

import com.sanem.exception.EntityNotFoundException;
import com.sanem.specification.SearchCriteria;
import com.sanem.specification.SpecificationHelper;
import com.sanem.model.dto.DataSubjectExportDTO;
import com.sanem.model.dto.DonorFilterDTO;
import com.sanem.model.dto.DonorFormDTO;
import com.sanem.model.dto.DonorDTO;
import com.sanem.model.entity.Donor;
import com.sanem.mapper.DonorCreateMapper;
import com.sanem.mapper.DonorDTOMapper;
import com.sanem.mapper.DonorUpdateMapper;
import com.sanem.repository.DonorRepository;
import com.sanem.specification.DonorSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DonorService {

    private final DonorRepository donorRepository;
    private final DonorCreateMapper donorCreateMapper;
    private final DonorDTOMapper donorDTOMapper;
    private final DonorUpdateMapper donorUpdateMapper;
    private final DataSubjectPrivacyService privacyService;

    public Donor generateDonor(DonorFormDTO donorFormDTO) {
        Donor donor = donorCreateMapper.convert(donorFormDTO);
        privacyService.apply(donor, donorFormDTO.legalBasis(), donorFormDTO.privacyPurpose(),
                donorFormDTO.privacyConsent());
        return donor;
    }

    @org.springframework.transaction.annotation.Transactional
    public void save (Donor donor) {
        boolean isNew = donor.getDonorId() == null;
        donorRepository.save(donor);
        privacyService.recordEvent(DataSubjectPrivacyService.DONOR, donor.getDonorId(),
                isNew ? "RECORDED" : "UPDATED", donor);
    }

    @org.springframework.transaction.annotation.Transactional
    public void anonymize(Donor donor) {
        donor.setName("Doador anonimizado");
        donor.setCpfCnpj(null);
        donor.setContact(null);
        donor.setEmail(null);
        privacyService.markAnonymized(donor);
        donorRepository.save(donor);
        privacyService.recordEvent(DataSubjectPrivacyService.DONOR, donor.getDonorId(), "ANONYMIZED", donor);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public DataSubjectExportDTO exportData(Donor donor) {
        return new DataSubjectExportDTO(java.time.LocalDateTime.now(), DataSubjectPrivacyService.DONOR,
                generateDonorDTO(donor), privacyService.history(DataSubjectPrivacyService.DONOR, donor.getDonorId()));
    }

    public DonorDTO generateDonorDTO(Donor donor) {
        return donorDTOMapper.convert(donor);
    }

    public Donor getOrNull(Long id){
        return donorRepository.findById(id).orElse(null);
    }

    public void updateDonor(Donor donor, DonorFormDTO donorFormDTO) {
        privacyService.apply(donor, donorFormDTO.legalBasis(), donorFormDTO.privacyPurpose(),
                donorFormDTO.privacyConsent());
        donorUpdateMapper.update(donor, donorFormDTO);
    }

    @org.springframework.transaction.annotation.Transactional
    public void delete(Donor donor) {
        donor.softDelete();
        donorRepository.save(donor);
    }

    public List<Donor> list(DonorFilterDTO donorFilterDTO) {
        Specification<Donor> donorSpecification = generateSpecification(donorFilterDTO);
        return donorRepository.findAll(donorSpecification);
    }

    public Page<Donor> list(Pageable pageable, DonorFilterDTO donorFilterDTO) {
        Specification<Donor> donorSpecification = generateSpecification(donorFilterDTO);
        return donorRepository.findAll(donorSpecification, pageable);
    }

    private Specification<Donor> generateSpecification(DonorFilterDTO donorFilterDTO) {
        SearchCriteria<String> nameCriteria = SpecificationHelper.generateInnerLikeCriteria("name", donorFilterDTO.name());
        SearchCriteria<String> cpfCnpjCriteria = SpecificationHelper.generateInnerLikeCriteria("cpfCnpj", donorFilterDTO.cpfCnpj());
        SearchCriteria<String> contactCriteria = SpecificationHelper.generateInnerLikeCriteria("contact", donorFilterDTO.contact());
        SearchCriteria<String> emailCriteria = SpecificationHelper.generateInnerLikeCriteria("email", donorFilterDTO.email());

        Specification<Donor> nameSpecification = new DonorSpecification(nameCriteria);
        Specification<Donor> cpfCnpjSpecification = new DonorSpecification(cpfCnpjCriteria);
        Specification<Donor> contactSpecification = new DonorSpecification(contactCriteria);
        Specification<Donor> emailSpecification = new DonorSpecification(emailCriteria);
        
        Specification<Donor> notDeletedSpecification = (root, query, criteriaBuilder) -> 
            criteriaBuilder.isNull(root.get("deletedAt"));

        return Specification.where(nameSpecification)
                .and(cpfCnpjSpecification)
                .and(contactSpecification)
                .and(emailSpecification)
                .and(notDeletedSpecification);
    }

    public Page<DonorDTO> generateDonorDTOPage(Page<Donor> itemPage) {
        return itemPage.map(this::generateDonorDTO);
    }

    public List<DonorDTO> generateDonorList(List<Donor> itemList) {
        return itemList.stream().map(donorDTOMapper::convert).toList();
    }

    public Donor getOrThrowException(Long id) {
        return donorRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Donor", id)
        );
    }

}
