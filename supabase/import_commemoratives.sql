-- ============================================================
-- Import des données réelles : 2€ commémoratives 2004-2006
-- Source : https://monnaies-euros.com/euro2commemorative{annee}.php
-- (les pays doivent déjà exister via import_sets.sql — exécuter celui-ci d'abord)
-- ============================================================

insert into commemorative_coins (country_id, year, name, mintage, issue_date, quotation, image_url) values
  ((select id from countries where slug='finlande'), 2004, 'Elargissement de l''Union européenne à dix nouveaux États membres', 1000000, 'juin 2004', 40.0, 'https://monnaies-euros.com/images/2euros_comme_Finlande_2004.webp'),
  ((select id from countries where slug='grece'), 2004, 'Jeux olympiques d''Athènes de 2004', 50000000, 'mars 2004', 3.0, 'https://monnaies-euros.com/images/2euros_comme_Grece_2004.webp'),
  ((select id from countries where slug='italie'), 2004, '50ème anniversaire du Programme alimentaire mondial', 16000000, 'décembre 2004', 3.0, 'https://monnaies-euros.com/images/2euros_comme_Italie_2004.webp'),
  ((select id from countries where slug='luxembourg'), 2004, 'Effigie et monogramme du Grand-Duc Henri', 2490000, 'juin 2004', 4.0, 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2004.webp'),
  ((select id from countries where slug='saint-marin'), 2004, 'Bartolomeo Borghesi (historien, numismate)', 110000, 'décembre 2004', 145.0, 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2004.webp'),
  ((select id from countries where slug='vatican'), 2004, '75ème anniversaire de la fondation de l''État de la Cité du Vatican', 100000, 'décembre 2004', 125.0, 'https://monnaies-euros.com/images/2euros_comme_Vatican_2004.webp'),
  ((select id from countries where slug='autriche'), 2005, '50e anniversaire du Traité d''État autrichien', 7000000, 'mai 2005', 3.0, 'https://monnaies-euros.com/images/2euros_comme_Autriche_2005.webp'),
  ((select id from countries where slug='belgique'), 2005, 'Union économique belgo-luxembourgeoise', 6000000, 'mars 2005', 4.5, 'https://monnaies-euros.com/images/2euros_comme_Belgique_2005.webp'),
  ((select id from countries where slug='espagne'), 2005, '4e centenaire de la première édition de « L''ingénieux hidalgo Don Quichotte de la Manche » de Miguel de Cervantes', 8000000, 'avril 2005', 4.0, 'https://monnaies-euros.com/images/2euros_comme_Espagne_2005.webp'),
  ((select id from countries where slug='finlande'), 2005, '60e anniversaire des Nations unies et 50e anniversaire de l''adhésion de la Finlande aux Nations unies', 2000000, 'octobre 2005', 5.0, 'https://monnaies-euros.com/images/2euros_comme_Finlande_2005.webp'),
  ((select id from countries where slug='italie'), 2005, '1er anniversaire de la signature de la Constitution européenne', 18000000, 'octobre 2005', 2.8, 'https://monnaies-euros.com/images/2euros_comme_Italie_2005.webp'),
  ((select id from countries where slug='luxembourg'), 2005, '50e anniversaire du Grand-Duc Henri, 5e anniversaire de son accession au trône et centenaire de la mort du Grand-Duc Adolphe', 2800000, 'janvier 2005', 3.9, 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2005.webp'),
  ((select id from countries where slug='saint-marin'), 2005, '2005, année mondiale de la physique', 130000, 'octobre 2005', 105.0, 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2005.webp'),
  ((select id from countries where slug='vatican'), 2005, '20e Journées mondiales de la jeunesse', 100000, 'décembre 2005', 200.0, 'https://monnaies-euros.com/images/2euros_comme_Vatican_2005.webp'),
  ((select id from countries where slug='allemagne'), 2006, 'Schleswig-Holstein', 30000000, 'février 2006', 2.2, 'https://monnaies-euros.com/images/2euros_comme_Allemagne_2006.webp'),
  ((select id from countries where slug='belgique'), 2006, 'Atomium', 5000000, 'avril 2006', 4.5, 'https://monnaies-euros.com/images/2euros_comme_Belgique_2006.webp'),
  ((select id from countries where slug='finlande'), 2006, '100e anniversaire du suffrage universel et égalitaire', 2500000, 'octobre 2006', 4.8, 'https://monnaies-euros.com/images/2euros_comme_Finlande_2006.webp'),
  ((select id from countries where slug='italie'), 2006, 'XXe Jeux olympiques d''hiver - Turin 2006', 40000000, 'janvier 2006', 2.5, 'https://monnaies-euros.com/images/2euros_comme_Italie_2006.webp'),
  ((select id from countries where slug='luxembourg'), 2006, '25e anniversaire de l''héritier du trône, le Grand-Duc Guillaume', 1100000, 'janvier 2006', 4.2, 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2006.webp'),
  ((select id from countries where slug='saint-marin'), 2006, '500e anniversaire de la mort de Christophe Colomb', 120000, 'octobre 2006', 100.0, 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2006.webp'),
  ((select id from countries where slug='vatican'), 2006, '5e centenaire de la Garde suisse pontificale', 100000, 'novembre 2006', 180.0, 'https://monnaies-euros.com/images/2euros_comme_Vatican_2006.webp');
