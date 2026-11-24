-- V21 - RNF05: índices trigram para buscas "contém" (%termo%), usadas por doadores,
-- itens e pontos de coleta. Complementam os índices de prefixo da V18.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_donor_name_trgm
    ON donor USING gin (lower(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_donor_cpf_cnpj_trgm
    ON donor USING gin (lower(cpf_cnpj) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_item_description_trgm
    ON item USING gin (lower(description) gin_trgm_ops)
    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_collection_point_name_trgm
    ON collection_point USING gin (lower(name) gin_trgm_ops)
    WHERE deleted_at IS NULL;
