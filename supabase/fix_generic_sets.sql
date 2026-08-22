-- ============================================================
-- Fix : fusionner les pièces "un seul pays" sur une ligne par année,
-- et ne garder une ligne dédiée ("année - raison") que pour les
-- éditions réellement partagées par plusieurs pays la même année.
--
-- À exécuter UNE SEULE FOIS, après migrate_commemorative_sets.sql
-- et import_commemoratives.sql (déjà en place, 2004-2010).
-- Ne touche pas aux données déjà correctes (éditions communes,
-- ex: Traité de Rome 2007, EMU 2009) — ne réorganise que les pièces
-- qui n'ont qu'un seul pays émetteur.
-- ============================================================

-- 1) Un set peut désormais ne pas avoir de raison précise (name = null)
--    -> c'est le set "générique" d'une année, qui regroupe les pièces
--    propres à chaque pays (pas de design partagé)
alter table commemorative_sets alter column name drop not null;

-- Un seul set générique par année
create unique index if not exists commemorative_sets_year_generic_uq
  on commemorative_sets (year) where name is null;

-- 2) Crée le set générique pour chaque année déjà présente
insert into commemorative_sets (year, name, sort_order)
select distinct year, null, 0
from commemorative_sets
on conflict (year) where name is null do nothing;

-- 3) Déplace les pièces des sets "un seul pays" vers le set générique
--    de leur année
with single_country_sets as (
  select cs.id as old_set_id, cs.year
  from commemorative_sets cs
  where cs.name is not null
    and (select count(*) from commemorative_coins cc where cc.set_id = cs.id) = 1
),
generic_sets as (
  select id, year from commemorative_sets where name is null
)
update commemorative_coins cc
set set_id = g.id
from single_country_sets s
join generic_sets g on g.year = s.year
where cc.set_id = s.old_set_id;

-- 4) Supprime les sets "un seul pays" devenus vides
delete from commemorative_sets cs
where cs.name is not null
  and not exists (select 1 from commemorative_coins cc where cc.set_id = cs.id);

-- 5) Ordre d'affichage : le set générique en premier dans chaque année,
--    puis les éditions communes dans leur ordre d'origine
update commemorative_sets set sort_order = 0 where name is null;

update commemorative_sets cs
set sort_order = sub.rn
from (
  select id, row_number() over (partition by year order by sort_order) as rn
  from commemorative_sets
  where name is not null
) sub
where cs.id = sub.id;
