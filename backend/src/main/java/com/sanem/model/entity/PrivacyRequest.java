package com.sanem.model.entity;

import com.sanem.model.enums.PrivacyRequestStatus;
import com.sanem.model.enums.PrivacyRequestType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "privacy_request")
@Getter
@Setter
@NoArgsConstructor
public class PrivacyRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_user_id", nullable = false)
    private AppUser requester;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false, length = 20)
    private PrivacyRequestType requestType;

    @Column(name = "description", nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PrivacyRequestStatus status = PrivacyRequestStatus.OPEN;

    @Column(name = "response_message", length = 2000)
    private String responseMessage;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) status = PrivacyRequestStatus.OPEN;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (status == PrivacyRequestStatus.COMPLETED || status == PrivacyRequestStatus.REJECTED) {
            if (resolvedAt == null) resolvedAt = updatedAt;
        } else {
            resolvedAt = null;
        }
    }
}
