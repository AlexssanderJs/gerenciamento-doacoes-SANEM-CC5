package com.sanem.controller;

import com.sanem.model.dto.DonationDTO;
import com.sanem.model.dto.DonationFormDTO;
import com.sanem.model.entity.Donor;
import com.sanem.service.AuthService;
import com.sanem.service.DonationService;
import com.sanem.service.DonorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/donation")
@RequiredArgsConstructor
public class DonationController {
    private final DonationService donationService;
    private final DonorService donorService;
    private final AuthService authService;

    @PostMapping({"", "/"})
    public ResponseEntity<DonationDTO> create(@Valid @RequestBody DonationFormDTO formDTO) {
        Donor donor = donorService.getOrThrowException(formDTO.donorId());
        DonationDTO created = donationService.create(formDTO, donor, authService.getCurrentUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonationDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(donationService.findById(id));
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<DonationDTO>> findAll(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            @RequestParam(required = false) String donorName,
            @RequestParam(required = false) String attendantName,
            @RequestParam(required = false) String itemName
    ) {
        return ResponseEntity.ok(donationService.findAllFiltered(startDate, endDate, donorName, attendantName, itemName));
    }

    @GetMapping("/page")
    public ResponseEntity<Page<DonationDTO>> findAllPaged(
            @PageableDefault(size = 50, sort = "donationDate", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            @RequestParam(required = false) String donorName,
            @RequestParam(required = false) String attendantName,
            @RequestParam(required = false) String itemName
    ) {
        return ResponseEntity.ok(donationService.findAllFiltered(
                pageable, startDate, endDate, donorName, attendantName, itemName));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        donationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
