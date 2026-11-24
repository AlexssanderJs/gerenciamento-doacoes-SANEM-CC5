-- V20 - RF04: permite registrar o mesmo item em estados de conservação diferentes
-- na mesma doação (ex.: 3 camisas NEW e 2 POOR). A restrição original da V1
-- (donation_id, item_id) impedia isso.
ALTER TABLE item_donated DROP CONSTRAINT IF EXISTS uk_item_donated;

ALTER TABLE item_donated
    ADD CONSTRAINT uk_item_donated_state UNIQUE (donation_id, item_id, conservation_state);
