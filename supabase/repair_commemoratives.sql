-- ============================================================
-- Réparation complète : doublons de pièces + fusion "1 pays -> 1
-- ligne par année" qui n'avait pas fonctionné.
-- Version robuste : les ajouts de contrainte n'annulent plus tout
-- le script s'il reste un cas résiduel (DO blocks + exception).
-- Sûr à exécuter plusieurs fois (idempotent).
-- ============================================================

-- 0) Retire les contraintes qui pourraient bloquer le nettoyage
alter table commemorative_sets drop constraint if exists commemorative_sets_year_name_key;
alter table commemorative_coins drop constraint if exists uq_set_country;

-- 1) Normalise toutes les variantes d'apostrophe (’ ‘ ´ `) vers une
--    apostrophe standard ', et supprime les espaces en trop
update commemorative_sets
set name = trim(regexp_replace(name, '[’‘´`]', '''', 'g'))
where name ~ '[’‘´`]' or name <> trim(name);

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
--    que la plus ancienne (méthode par ctid, garantie fiable)
delete from commemorative_coins
where ctid not in (
  select min(ctid) from commemorative_coins group by set_id, country_id
);

-- 4) Remet les contraintes — sans faire échouer tout le script s'il
--    reste un cas imprévu (l'important, l'étape 5, s'exécutera quand
--    même dans ce cas)
do $$
begin
  alter table commemorative_sets add constraint commemorative_sets_year_name_key unique (year, name);
exception when unique_violation then
  raise notice 'Contrainte sets non réappliquée : doublon résiduel à examiner manuellement.';
end $$;

do $$
begin
  alter table commemorative_coins add constraint uq_set_country unique (set_id, country_id);
exception when unique_violation then
  raise notice 'Contrainte pièces non réappliquée : doublon résiduel à examiner manuellement.';
end $$;

-- 5) Refait la fusion "1 seul pays -> ligne générique de l'année"
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

-- 7) Diagnostic : liste les doublons résiduels éventuels (devrait ne
--    rien renvoyer si tout s'est bien passé)
select set_id, country_id, count(*)
from commemorative_coins
group by set_id, country_id
having count(*) > 1;
