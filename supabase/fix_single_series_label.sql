-- ============================================================
-- Harmonisation du texte : les pays à série unique affichaient
-- juste "(2002-)" — on préfixe "1re série " pour que ce soit
-- cohérent avec les pays multi-séries ("1re série (1999-2007)").
-- Ne touche pas aux séries qui contiennent déjà "série" dans leur
-- libellé (les pays multi-séries), donc sûr à ré-exécuter.
-- ============================================================
update coin_series cs
set label = '1re série ' || cs.label
where cs.country_id in (
  select country_id from coin_series group by country_id having count(*) = 1
)
and cs.label not ilike '%série%';
