-- Índices para consultas paginadas de catálogo, mapa e histórico.
-- A aplicação usa buscas por prefixo (termo%) para aproveitar text_pattern_ops.
CREATE INDEX IF NOT EXISTS idx_item_active_description_prefix
    ON item (lower(description) text_pattern_ops)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_item_active_tag_prefix
    ON item (lower(tag_code) text_pattern_ops)
    WHERE deleted_at IS NULL AND tag_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_item_active_category
    ON item (category_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_collection_point_active_name_prefix
    ON collection_point (lower(name) text_pattern_ops)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_collection_point_active_city_prefix
    ON collection_point (lower(city) text_pattern_ops)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_collection_point_active_neighborhood_prefix
    ON collection_point (lower(neighborhood) text_pattern_ops)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_donation_active_date
    ON donation (donation_date DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_donation_active_donor
    ON donation (donor_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_donation_active_receiver
    ON donation (receiver_user_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_item_donated_active_donation
    ON item_donated (donation_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_donor_name_prefix
    ON donor (lower(name) text_pattern_ops);

CREATE INDEX IF NOT EXISTS idx_app_user_name_prefix
    ON app_user (lower(name) text_pattern_ops);
