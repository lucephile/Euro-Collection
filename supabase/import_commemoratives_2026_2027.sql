-- ============================================================
-- Import des 2€ commémoratives 2026 (28 pièces déjà annoncées)
-- et 2027 (1 seule pièce annoncée pour l'instant, Allemagne).
-- Aucune édition de la liste blanche sur ces deux années.
-- Ces deux pages sources sont mises à jour progressivement par le
-- site — à réimporter plus tard si de nouvelles pièces sont ajoutées
-- (le script est sûr à ré-exécuter : les sets génériques déjà en
-- place seront réutilisés).
-- Nécessite fix_and_import_2011_2017.sql déjà exécuté.
-- ============================================================

-- --- 2026 (28 pièces, 2 ligne(s) générique(s)) ---
insert into commemorative_sets (year, name, sort_order) values
  (2026, null, 0),
  (2026, null, 1);

insert into commemorative_coins (set_id, country_id, name, mintage, issue_date, quotation, image_url) values
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='allemagne'), '150e anniversaire de la naissance de Konrad Adenauer', 30000000, '8 janvier 2026', 2.2, 'https://monnaies-euros.com/images/2euros_comme_Allemagne_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=1), (select id from countries where slug='allemagne'), 'Bremen — Klimahaus Bremerhaven', 30000000, '29 janvier 2026', 2.2, 'https://monnaies-euros.com/images/2euros_comme_Allemagne2_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='belgique'), '100 ans de SNCB', 157000, 'juin 2026', 14.0, 'https://monnaies-euros.com/images/2euros_comme_Belgique_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='chypre'), 'Présidence chypriote du Conseil de l''Union européenne au premier semestre 2026', 275000, '17 avril 2026', 4.8, 'https://monnaies-euros.com/images/2euros_comme_Chypre_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='croatie'), '100 ans de la Radio-télévision croate', 200000, '16 juillet 2026', 12.0, 'https://monnaies-euros.com/images/2euros_comme_Croatie_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='espagne'), 'Monastère de Poblet', 1500000, '1er trimestre 2026', 4.0, 'https://monnaies-euros.com/images/2euros_comme_Espagne_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=1), (select id from countries where slug='espagne'), 'Article 49 de la Constitution espagnole – Inclusion', 1500000, '1er trimestre 2026', 4.0, 'https://monnaies-euros.com/images/2euros_comme_Espagne2_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='estonie'), 'Sipsik', 1000000, '5 juin 2026', 3.5, 'https://monnaies-euros.com/images/2euros_comme_Estonie_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='finlande'), '100 ans de la radiodiffusion finlandaise (Yleisradio)', 205000, '21 mai 2026', 13.0, 'https://monnaies-euros.com/images/2euros_comme_Finlande_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=1), (select id from countries where slug='finlande'), 'Raili et Reima Pietilä', 205000, 'août 2026', 13.0, 'https://monnaies-euros.com/images/2euros_comme_Finlande2_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='france'), '400 ans de la Marine nationale', 20000000, '2026', 2.3, 'https://monnaies-euros.com/images/2euros_comme_France2_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=1), (select id from countries where slug='france'), 'Le Petit Prince d''Antoine de Saint-Exupéry', 320000, '2026', 13.0, 'https://monnaies-euros.com/images/2euros_comme_France_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='grece'), '200 ans de la sortie de Missolonghi', 740500, '29 septembre 2026', 3.5, 'https://monnaies-euros.com/images/2euros_comme_Grece_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=1), (select id from countries where slug='grece'), '100 ans de la fondation de l''Académie d''Athènes', 740500, '15 juin 2026', 3.5, 'https://monnaies-euros.com/images/2euros_comme_Grece2_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='irlande'), 'Présidence irlandaise du Conseil de l''Union européenne', 500000, '7 juillet 2026', 3.8, 'https://monnaies-euros.com/images/2euros_comme_Irlande_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='italie'), '200e anniversaire de la naissance de Carlo Collodi – Pinocchio', 3000000, '5 mars 2026', 6.0, 'https://monnaies-euros.com/images/2euros_comme_Italie_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=1), (select id from countries where slug='italie'), '800e anniversaire de la mort de saint François d''Assise', 3000000, '1er avril 2026', 6.0, 'https://monnaies-euros.com/images/2euros_comme_Italie2_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='lituanie'), 'Indépendance énergétique de la Lituanie', 500000, '18 mars 2026', 3.4, 'https://monnaies-euros.com/images/2euros_comme_Lituanie_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='luxembourg'), '40e anniversaire de l''attribution du Prix international Charlemagne au peuple luxembourgeois', 131000, 'juillet 2026', 10.0, 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=1), (select id from countries where slug='luxembourg'), 'Accession au trône du Grand-Duc Guillaume et son 45e anniversaire', 131000, 'juillet 2026', 10.0, 'https://monnaies-euros.com/images/2euros_comme_Luxembourg2_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='malte'), 'Il-Kelb tal-Fenek', 37200, '2026 (date précise non publiée)', 18.0, 'https://monnaies-euros.com/images/2euros_comme_Malte2_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=1), (select id from countries where slug='malte'), 'Villes fortifiées de Malte – La Valette', 37200, '17 avril 2026', 18.0, 'https://monnaies-euros.com/images/2euros_comme_Malte_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='monaco'), 'Duché de Valentinois', 15000, 'juin 2026', 270.0, 'https://monnaies-euros.com/images/2euros_comme_Monaco_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='portugal'), '100 ans du Rotary International au Portugal', 500000, 'juillet 2026', 3.5, 'https://monnaies-euros.com/images/2euros_comme_Portugal_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='saint-marin'), '450e anniversaire de la mort de Titien', 60000, '31 mars 2026', 36.0, 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='slovaquie'), '50e anniversaire de la victoire de la Tchécoslovaquie au Championnat d''Europe de football 1976', 1000000, '15 juin 2026', 3.5, 'https://monnaies-euros.com/images/2euros_comme_Slovaquie2_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=1), (select id from countries where slug='slovaquie'), 'Trenčín – Capitale européenne de la culture 2026', 1000000, '13 janvier 2026', 3.5, 'https://monnaies-euros.com/images/2euros_comme_Slovaquie_2026.webp'),
  ((select id from commemorative_sets where year=2026 and name is null and sort_order=0), (select id from countries where slug='slovenie'), '150e anniversaire de la naissance d''Ivan Cankar', 994000, '17 juin 2026', 3.2, 'https://monnaies-euros.com/images/2euros_comme_Slovenie_2026.webp');

-- --- 2027 (1 pièces, 1 ligne(s) générique(s)) ---
insert into commemorative_sets (year, name, sort_order) values
  (2027, null, 0);

insert into commemorative_coins (set_id, country_id, name, mintage, issue_date, quotation, image_url) values
  ((select id from commemorative_sets where year=2027 and name is null and sort_order=0), (select id from countries where slug='allemagne'), 'Rhénanie-du-Nord-Westphalie – Cathédrale d''Aix-la-Chapelle', 30000000, '26 janvier 2027', 2.2, 'https://monnaies-euros.com/images/2euros_comme_Allemagne_2027.webp');

