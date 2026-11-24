package com.sanem.repository;

import com.sanem.model.entity.PrivacyConsentEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrivacyConsentEventRepository extends JpaRepository<PrivacyConsentEvent, Long> {
    List<PrivacyConsentEvent> findByUserUserIdOrderByOccurredAtDesc(Long userId);
}
