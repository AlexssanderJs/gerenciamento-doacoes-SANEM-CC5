package com.sanem.repository;

import com.sanem.model.entity.PrivacyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrivacyRequestRepository extends JpaRepository<PrivacyRequest, Long> {
    List<PrivacyRequest> findByRequesterUserIdOrderByCreatedAtDesc(Long userId);
}
