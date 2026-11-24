-- V14 - Registra categoria e estado de conservação por linha de doação.
-- PostgreSQL: migração compatível com o schema atual do SANEM.

INSERT INTO category (name)
VALUES ('Outros')
ON CONFLICT (name) DO UPDATE SET deleted_at = NULL;

ALTER TABLE item_donated
    ADD COLUMN category_id INTEGER,
    ADD COLUMN conservation_state VARCHAR(16) NOT NULL DEFAULT 'GOOD';

-- Preserva os registros existentes, reaproveitando a categoria do item de
-- estoque e usando "Outros" quando o item ainda não possui categoria.
UPDATE item_donated AS donated
SET category_id = COALESCE(
    inventory_item.category_id,
    (SELECT category_id FROM category WHERE name = 'Outros' LIMIT 1)
)
FROM item AS inventory_item
WHERE inventory_item.item_id = donated.item_id;

ALTER TABLE item_donated
    ALTER COLUMN category_id SET NOT NULL;

ALTER TABLE item_donated
    ADD CONSTRAINT fk_item_donated_category
    FOREIGN KEY (category_id) REFERENCES category(category_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE item_donated
    ADD CONSTRAINT chk_item_donated_conservation_state
    CHECK (conservation_state IN ('NEW', 'GOOD', 'FAIR', 'POOR'));

CREATE INDEX IF NOT EXISTS idx_item_donated_category
    ON item_donated(category_id);
