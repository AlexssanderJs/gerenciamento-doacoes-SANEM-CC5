-- V15 - Consentimento explícito para a política de privacidade (LGPD).
-- Usuários existentes precisarão aceitar a política no próximo acesso.
ALTER TABLE app_user
    ADD COLUMN privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN privacy_consent_at TIMESTAMP(6) NULL,
    ADD COLUMN privacy_consent_revoked_at TIMESTAMP(6) NULL,
    ADD COLUMN privacy_consent_version VARCHAR(50) NULL;
