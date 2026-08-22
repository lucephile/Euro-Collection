-- ============================================================
-- Réparation complète : doublons de pièces + fusion "1 pays -> 1
-- ligne par année" qui n'avait pas fonctionné.
-- Cause probable : import_commemoratives.sql exécuté plusieurs fois
-- pendant les tests -> pièces dupliquées -> le comptage "exactement
-- 1 pays" du script précédent ne matchait plus rien.
-- Sûr à exécuter même si vous n'êtes pas certain de l'état actuel :
-- toutes les étapes sont idempotentes (peuvent être relancées).
-- ============================================================

-- 1) Normalise les apostrophes dans les noms de set (certaines
--    entrées avaient une apostrophe typographique ’ au lieu de ' ,
--    ce qui créait des sets en double pour la même édition commune)
update commemorative_sets set name = replace(name, '’', '''') where name like '%’%';

-- 2) Fusionne les sets devenus identiques après normalisation
--    (même année + même nom) : déplace leurs pièces vers le plus
--    ancien, puis supprime les doublons de set
with dupes as (
  select year, name, min(id) as keep_id, array_agg(id) as all_ids
  from commemorative_sets
  where name is not null
  group by year, name
  having count(*) > 1
)
update commemorative_coins cc
set set_id = d.keep_id
from dupes d
where cc.set_id = any(d.all_ids) and cc.set_id <> d.keep_id;

with dupes as (
  select year, name, min(id) as keep_id, array_agg(id) as all_ids
  from commemorative_sets
  where name is not null
  group by year, name
  having count(*) > 1
)
delete from commemorative_sets cs
using dupes d
where cs.id = any(d.all_ids) and cs.id <> d.keep_id;

-- 3) Supprime les pièces en double (même set + même pays), ne garde
--    que la plus ancienne
delete from commemorative_coins cc
using commemorative_coins cc2
where cc.set_id = cc2.set_id
  and cc.country_id = cc2.country_id
  and cc.id > cc2.id;

-- 4) Empêche que ça se reproduise à l'avenir
alter table commemorative_coins
  drop constraint if exists uq_set_country;
alter table commemorative_coins
  add constraint uq_set_country unique (set_id, country_id);

-- 5) Refait la fusion "1 seul pays -> ligne générique de l'année"
--    (cette fois le comptage est fiable, les doublons sont partis)
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

delete from commemorative_sets cs
where cs.name is not null
  and not exists (select 1 from commemorative_coins cc where cc.set_id = cs.id);

-- 6) Ré-ordonne : ligne générique en premier dans chaque année, puis
--    les éditions communes dans leur ordre d'origine
update commemorative_sets set sort_order = 0 where name is null;

update commemorative_sets cs
set sort_order = sub.rn
from (
  select id, row_number() over (partition by year order by sort_order) as rn
  from commemorative_sets
  where name is not null
) sub
where cs.id = sub.id;
