-- Solicitações de exercício de direitos dos titulares (acesso, correção, eliminação etc.).
CREATE TABLE privacy_request (
    request_id BIGSERIAL PRIMARY KEY,
    requester_user_id BIGINT NOT NULL REFERENCES app_user(user_id),
    request_type VARCHAR(20) NOT NULL CHECK (
        request_type IN ('ACCESS', 'CORRECTION', 'DELETION', 'PORTABILITY', 'OBJECTION', 'OTHER')
    ),
    description VARCHAR(2000) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (
        status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'REJECTED')
    ),
    response_message VARCHAR(2000),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP(6)
);

CREATE INDEX idx_privacy_request_requester_created
    ON privacy_request (requester_user_id, created_at DESC);
CREATE INDEX idx_privacy_request_status_created
    ON privacy_request (status, created_at DESC);
