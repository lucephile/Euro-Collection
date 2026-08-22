-- ============================================================
-- Migration : regroupement des 2€ commémoratives par "set"
-- (année + raison), pour gérer :
--  - plusieurs pièces différentes d'un même pays la même année
--  - les émissions communes (même design, plusieurs pays) affichées
--    sur UNE seule ligne "année - raison" au lieu d'être dispersées
--
-- À exécuter UNE SEULE FOIS, après schema.sql + import_sets.sql +
-- import_commemoratives.sql (2004-2006, déjà en place). Convertit les
-- données existantes automatiquement — rien à ré-importer pour 2004-2006.
-- ============================================================

-- 1) Nouvelle table : un set = une année + une raison d'émission
create table commemorative_sets (
  id serial primary key,
  year int not null,
  name text not null,
  sort_order int default 0,
  unique (year, name)
);
alter table commemorative_sets enable row level security;
create policy "public read commemorative_sets" on commemorative_sets for select using (true);
create index on commemorative_sets (year);

-- 2) Ajoute la colonne de lien (nullable pour l'instant, le temps de la migration)
alter table commemorative_coins add column set_id int references commemorative_sets(id) on delete cascade;

-- 3) Crée un set pour chaque (year, name) déjà présent dans commemorative_coins,
--    avec un sort_order basé sur l'ordre d'insertion (id croissant)
insert into commemorative_sets (year, name, sort_order)
select year, name, row_number() over (partition by year order by min(id)) - 1
from commemorative_coins
group by year, name;

-- 4) Relie chaque pièce existante à son set
update commemorative_coins cc
set set_id = cs.id
from commemorative_sets cs
where cc.year = cs.year and cc.name = cs.name;

-- 5) Nettoyage : les infos année/raison vivent désormais dans commemorative_sets
alter table commemorative_coins alter column set_id set not null;
alter table commemorative_coins drop column year;
alter table commemorative_coins drop column name;
create index on commemorative_coins (set_id);
