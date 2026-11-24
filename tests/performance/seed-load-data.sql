-- Popula o banco com volume representativo para o teste de desempenho (RNF05).
-- USO: apenas em ambiente de teste/desenvolvimento. Rode com psql -f tests/performance/seed-load-data.sql
-- Todos os registros recebem o prefixo "LOADTEST" para facilitar a limpeza:
--   DELETE FROM item_donated WHERE donation_id IN (SELECT donation_id FROM donation WHERE donor_id IN (SELECT donor_id FROM donor WHERE name LIKE 'LOADTEST%'));
--   DELETE FROM donation WHERE donor_id IN (SELECT donor_id FROM donor WHERE name LIKE 'LOADTEST%');
--   DELETE FROM donor WHERE name LIKE 'LOADTEST%'; DELETE FROM item WHERE description LIKE 'LOADTEST%';

INSERT INTO donor (name, cpf_cnpj, contact, email, legal_basis, privacy_consent)
SELECT 'LOADTEST Doador ' || g, lpad(g::text, 11, '9'), '4599' || lpad(g::text, 7, '0'),
       'loadtest' || g || '@example.com', 'LEGITIMATE_INTEREST', FALSE
FROM generate_series(1, 5000) AS g;

INSERT INTO item (description, stock_quantity, tag_code)
SELECT 'LOADTEST Item ' || g, (random() * 100)::int, 'LT-' || g
FROM generate_series(1, 10000) AS g;

INSERT INTO donation (donation_date, receiver_user_id, donor_id)
SELECT now() - (random() * interval '365 days'),
       (SELECT min(user_id) FROM app_user),
       d.donor_id
FROM (SELECT donor_id FROM donor WHERE name LIKE 'LOADTEST%') AS d,
     generate_series(1, 10);

INSERT INTO item_donated (donation_id, item_id, quantity, category_id, conservation_state)
SELECT dn.donation_id,
       (SELECT item_id FROM item WHERE description LIKE 'LOADTEST%' ORDER BY random() LIMIT 1),
       1 + (random() * 9)::int,
       (SELECT min(category_id) FROM category),
       'GOOD'
FROM donation dn
WHERE dn.donor_id IN (SELECT donor_id FROM donor WHERE name LIKE 'LOADTEST%');

ANALYZE;
