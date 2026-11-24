package com.sanem.model.dto;

import java.time.LocalDateTime;
import java.util.List;

/** Exportação dos dados de um titular (doador/beneficiário) e do histórico de tratamento. */
public record DataSubjectExportDTO(
        LocalDateTime generatedAt,
        String subjectType,
        Object data,
        List<DataSubjectPrivacyEventDTO> privacyHistory
) {
}
