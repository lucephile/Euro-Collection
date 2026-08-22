-- ============================================================
-- Correction : deux pièces avaient été mises sur une ligne dédiée
-- alors qu'elles ne sont que des coïncidences de nom entre pays,
-- pas de vraies éditions coordonnées — elles rejoignent la ligne
-- générique de leur année, comme toute pièce "un seul pays".
--
-- Rappel de la liste exhaustive des vraies éditions communes :
--   2007 - 50ème anniversaire du traité de Rome
--   2009 - 10ème anniversaire de l'Union économique et monétaire
--   2012 - 10 ans de l'euro (pas encore importé)
--   2015 - 30 ans du drapeau européen (pas encore importé)
--   2022 - 30 ans Erasmus (pas encore importé)
-- Toute autre pièce va sur la ligne générique de son année, même si
-- son nom coïncide avec celui d'un autre pays.
-- ============================================================

with braille_set as (
  select id, year from commemorative_sets
  where name = 'Bicentenaire de la naissance de Louis Braille'
),
generic_2009 as (
  select id from commemorative_sets where year = 2009 and name is null
)
update commemorative_coins cc
set set_id = g.id
from braille_set b, generic_2009 g
where cc.set_id = b.id;

delete from commemorative_sets
where name = 'Bicentenaire de la naissance de Louis Braille';

-- Même correction pour "60e anniversaire de la Déclaration Universelle des
-- Droits de l'Homme" (2008, Belgique + Finlande + Italie + Portugal) :
-- coïncidence de nom, pas une édition coordonnée -> ligne générique 2008
with dudh_set as (
  select id, year from commemorative_sets
  where name = '60e anniversaire de la Déclaration Universelle des Droits de l''Homme'
),
generic_2008 as (
  select id from commemorative_sets where year = 2008 and name is null
)
update commemorative_coins cc
set set_id = g.id
from dudh_set d, generic_2008 g
where cc.set_id = d.id;

delete from commemorative_sets
where name = '60e anniversaire de la Déclaration Universelle des Droits de l''Homme';
