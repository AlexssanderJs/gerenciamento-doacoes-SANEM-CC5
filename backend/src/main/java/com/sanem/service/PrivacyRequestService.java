package com.sanem.service;

import com.sanem.exception.EntityNotFoundException;
import com.sanem.model.dto.PrivacyRequestDTO;
import com.sanem.model.dto.PrivacyRequestFormDTO;
import com.sanem.model.dto.PrivacyRequestUpdateDTO;
import com.sanem.model.entity.AppUser;
import com.sanem.model.entity.PrivacyRequest;
import com.sanem.model.enums.PrivacyRequestStatus;
import com.sanem.repository.PrivacyRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrivacyRequestService {
    private final PrivacyRequestRepository repository;

    @Transactional
    public PrivacyRequestDTO create(PrivacyRequestFormDTO form, AppUser requester) {
        PrivacyRequest request = new PrivacyRequest();
        request.setRequester(requester);
        request.setRequestType(form.requestType());
        request.setDescription(form.description().trim());
        request.setStatus(PrivacyRequestStatus.OPEN);
        return toDTO(repository.save(request));
    }

    @Transactional(readOnly = true)
    public List<PrivacyRequestDTO> listMine(Long userId) {
        return repository.findByRequesterUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public Page<PrivacyRequestDTO> listAll(Pageable pageable) {
        return repository.findAll(pageable).map(this::toDTO);
    }

    @Transactional
    public PrivacyRequestDTO update(Long requestId, PrivacyRequestUpdateDTO form) {
        PrivacyRequest request = repository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("PrivacyRequest", requestId));
        request.setStatus(form.status());
        request.setResponseMessage(form.responseMessage() == null ? null : form.responseMessage().trim());
        return toDTO(repository.save(request));
    }

    private PrivacyRequestDTO toDTO(PrivacyRequest request) {
        AppUser requester = request.getRequester();
        return new PrivacyRequestDTO(
                request.getRequestId(),
                requester.getUserId(),
                requester.getName(),
                requester.getEmail(),
                request.getRequestType(),
                request.getDescription(),
                request.getStatus(),
                request.getResponseMessage(),
                request.getCreatedAt(),
                request.getUpdatedAt(),
                request.getResolvedAt()
        );
    }
}
