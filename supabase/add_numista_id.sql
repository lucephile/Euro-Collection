-- ============================================================
-- Ajoute la colonne qui stockera l'identifiant Numista de chaque
-- pièce commémorative, une fois la correspondance établie.
-- ============================================================
alter table commemorative_coins add column if not exists numista_id integer;
alter table commemorative_coins add column if not exists quotation_updated_at timestamptz;
