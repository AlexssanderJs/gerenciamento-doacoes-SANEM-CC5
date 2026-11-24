package com.sanem.controller;

import com.sanem.model.dto.PrivacyRequestDTO;
import com.sanem.model.dto.PrivacyRequestFormDTO;
import com.sanem.model.dto.PrivacyRequestUpdateDTO;
import com.sanem.model.entity.AppUser;
import com.sanem.service.AuthService;
import com.sanem.service.PrivacyRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/privacy-request")
public class PrivacyRequestController {
    private final PrivacyRequestService service;
    private final AuthService authService;

    @PostMapping("/me")
    public ResponseEntity<PrivacyRequestDTO> createMine(@RequestBody @Valid PrivacyRequestFormDTO form) {
        AppUser requester = authService.getCurrentUser();
        return ResponseEntity.status(201).body(service.create(form, requester));
    }

    @GetMapping("/me")
    public ResponseEntity<List<PrivacyRequestDTO>> listMine() {
        AppUser requester = authService.getCurrentUser();
        return ResponseEntity.ok(service.listMine(requester.getUserId()));
    }

    @GetMapping
    public ResponseEntity<Page<PrivacyRequestDTO>> listAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(service.listAll(pageable));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PrivacyRequestDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid PrivacyRequestUpdateDTO form
    ) {
        return ResponseEntity.ok(service.update(id, form));
    }
}
