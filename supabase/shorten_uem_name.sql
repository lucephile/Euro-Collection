-- ============================================================
-- Raccourcit le nom de l'édition commune 2009 pour l'affichage
-- (moins large sur mobile)
-- ============================================================
update commemorative_sets
set name = '10ème anniversaire de l''UEM'
where year = 2009 and name = '10ème anniversaire de l''Union économique et monétaire';
