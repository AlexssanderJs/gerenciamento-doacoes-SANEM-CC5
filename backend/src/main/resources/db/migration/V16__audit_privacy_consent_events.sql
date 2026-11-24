-- Histórico auditável de aceite e revogação da política de privacidade.
CREATE TABLE privacy_consent_event (
    event_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    event_type VARCHAR(16) NOT NULL CHECK (event_type IN ('ACCEPTED', 'REVOKED')),
    policy_version VARCHAR(50) NOT NULL,
    occurred_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(64),
    user_agent VARCHAR(512)
);

CREATE INDEX idx_privacy_consent_event_user_time
    ON privacy_consent_event (user_id, occurred_at DESC);
