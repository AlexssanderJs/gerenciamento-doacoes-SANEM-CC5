package com.sanem.repository;

import com.sanem.model.entity.DataSubjectPrivacyEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DataSubjectPrivacyEventRepository extends JpaRepository<DataSubjectPrivacyEvent, Long> {
    List<DataSubjectPrivacyEvent> findBySubjectTypeAndSubjectIdOrderByOccurredAtDesc(String subjectType, Long subjectId);
}
