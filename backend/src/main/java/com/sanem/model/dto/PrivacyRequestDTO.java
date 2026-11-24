package com.sanem.model.dto;

import com.sanem.model.enums.PrivacyRequestStatus;
import com.sanem.model.enums.PrivacyRequestType;
import java.time.LocalDateTime;

public record PrivacyRequestDTO(
        Long requestId,
        Long requesterUserId,
        String requesterName,
        String requesterEmail,
        PrivacyRequestType requestType,
        String description,
        PrivacyRequestStatus status,
        String responseMessage,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt
) {}
