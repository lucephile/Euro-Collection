-- ============================================================
-- Réinitialisation complète des 2€ commémoratives (2004-2010)
-- Repart de zéro : supprime et recrée commemorative_sets et
-- commemorative_coins avec la structure finale correcte dès le
-- départ (plus besoin des scripts de migration précédents).
-- Source : https://monnaies-euros.com/euro2commemorative{annee}.php
-- À exécuter après schema.sql + import_sets.sql (pays déjà en place).
-- ============================================================

-- 0) Nettoyage complet (repart de zéro)
truncate table user_collection_commemoratives;
drop table if exists commemorative_coins cascade;
drop table if exists commemorative_sets cascade;

-- 1) Structure définitive
create table commemorative_sets (
  id serial primary key,
  year int not null,
  name text,              -- null = pièces "un seul pays" de cette année, regroupées ensemble
  sort_order int default 0,
  unique (year, name)
);
alter table commemorative_sets enable row level security;
create policy "public read commemorative_sets" on commemorative_sets for select using (true);
create unique index commemorative_sets_year_generic_uq on commemorative_sets (year) where name is null;
create index on commemorative_sets (year);

create table commemorative_coins (
  id serial primary key,
  set_id int references commemorative_sets(id) on delete cascade,
  country_id int references countries(id) on delete cascade,
  name text not null,      -- raison propre à cette pièce (toujours renseignée)
  mintage bigint,
  issue_date text,
  quotation numeric(10,2),
  image_url text not null,
  unique (set_id, country_id)
);
alter table commemorative_coins enable row level security;
create policy "public read commemoratives" on commemorative_coins for select using (true);
create index on commemorative_coins (set_id);
create index on commemorative_coins (country_id);

alter table user_collection_commemoratives
  add constraint user_collection_commemoratives_commemorative_id_fkey
  foreign key (commemorative_id) references commemorative_coins(id) on delete cascade;

drop policy if exists "public read commem collection if profile public" on user_collection_commemoratives;
create policy "public read commem collection if profile public" on user_collection_commemoratives
  for select using (
    exists (select 1 from profiles p where p.user_id = user_collection_commemoratives.user_id and p.is_public)
  );

-- 2) Sets nommés (éditions communes à >= 2 pays)
insert into commemorative_sets (year, name, sort_order) values
  (2007, '50ème anniversaire du traité de Rome', 1),
  (2008, '60e anniversaire de la Déclaration Universelle des Droits de l''Homme', 1),
  (2009, '10ème anniversaire de l''Union économique et monétaire', 1),
  (2009, 'Bicentenaire de la naissance de Louis Braille', 2);

-- 3) Sets génériques (une ligne par année pour les pièces "un seul pays")
insert into commemorative_sets (year, name, sort_order) values
  (2004, null, 0),
  (2005, null, 0),
  (2006, null, 0),
  (2007, null, 0),
  (2008, null, 0),
  (2009, null, 0),
  (2010, null, 0);

-- 4) Pièces
insert into commemorative_coins (set_id, country_id, name, mintage, issue_date, quotation, image_url) values
  ((select id from commemorative_sets where year=2004 and name is null), (select id from countries where slug='finlande'), 'Elargissement de l''Union européenne à dix nouveaux États membres', 1000000, 'juin 2004', 40.0, 'https://monnaies-euros.com/images/2euros_comme_Finlande_2004.webp'),
  ((select id from commemorative_sets where year=2004 and name is null), (select id from countries where slug='grece'), 'Jeux olympiques d''Athènes de 2004', 50000000, 'mars 2004', 3.0, 'https://monnaies-euros.com/images/2euros_comme_Grece_2004.webp'),
  ((select id from commemorative_sets where year=2004 and name is null), (select id from countries where slug='italie'), '50ème anniversaire du Programme alimentaire mondial', 16000000, 'décembre 2004', 3.0, 'https://monnaies-euros.com/images/2euros_comme_Italie_2004.webp'),
  ((select id from commemorative_sets where year=2004 and name is null), (select id from countries where slug='luxembourg'), 'Effigie et monogramme du Grand-Duc Henri', 2490000, 'juin 2004', 4.0, 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2004.webp'),
  ((select id from commemorative_sets where year=2004 and name is null), (select id from countries where slug='saint-marin'), 'Bartolomeo Borghesi (historien, numismate)', 110000, 'décembre 2004', 145.0, 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2004.webp'),
  ((select id from commemorative_sets where year=2004 and name is null), (select id from countries where slug='vatican'), '75ème anniversaire de la fondation de l''État de la Cité du Vatican', 100000, 'décembre 2004', 125.0, 'https://monnaies-euros.com/images/2euros_comme_Vatican_2004.webp'),
  ((select id from commemorative_sets where year=2005 and name is null), (select id from countries where slug='autriche'), '50e anniversaire du Traité d''État autrichien', 7000000, 'mai 2005', 3.0, 'https://monnaies-euros.com/images/2euros_comme_Autriche_2005.webp'),
  ((select id from commemorative_sets where year=2005 and name is null), (select id from countries where slug='belgique'), 'Union économique belgo-luxembourgeoise', 6000000, 'mars 2005', 4.5, 'https://monnaies-euros.com/images/2euros_comme_Belgique_2005.webp'),
  ((select id from commemorative_sets where year=2005 and name is null), (select id from countries where slug='espagne'), '4e centenaire de la première édition de « L''ingénieux hidalgo Don Quichotte de la Manche » de Miguel de Cervantes', 8000000, 'avril 2005', 4.0, 'https://monnaies-euros.com/images/2euros_comme_Espagne_2005.webp'),
  ((select id from commemorative_sets where year=2005 and name is null), (select id from countries where slug='finlande'), '60e anniversaire des Nations unies et 50e anniversaire de l''adhésion de la Finlande aux Nations unies', 2000000, 'octobre 2005', 5.0, 'https://monnaies-euros.com/images/2euros_comme_Finlande_2005.webp'),
  ((select id from commemorative_sets where year=2005 and name is null), (select id from countries where slug='italie'), '1er anniversaire de la signature de la Constitution européenne', 18000000, 'octobre 2005', 2.8, 'https://monnaies-euros.com/images/2euros_comme_Italie_2005.webp'),
  ((select id from commemorative_sets where year=2005 and name is null), (select id from countries where slug='luxembourg'), '50e anniversaire du Grand-Duc Henri, 5e anniversaire de son accession au trône et centenaire de la mort du Grand-Duc Adolphe', 2800000, 'janvier 2005', 3.9, 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2005.webp'),
  ((select id from commemorative_sets where year=2005 and name is null), (select id from countries where slug='saint-marin'), '2005, année mondiale de la physique', 130000, 'octobre 2005', 105.0, 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2005.webp'),
  ((select id from commemorative_sets where year=2005 and name is null), (select id from countries where slug='vatican'), '20e Journées mondiales de la jeunesse', 100000, 'décembre 2005', 200.0, 'https://monnaies-euros.com/images/2euros_comme_Vatican_2005.webp'),
  ((select id from commemorative_sets where year=2006 and name is null), (select id from countries where slug='allemagne'), 'Schleswig-Holstein', 30000000, 'février 2006', 2.2, 'https://monnaies-euros.com/images/2euros_comme_Allemagne_2006.webp'),
  ((select id from commemorative_sets where year=2006 and name is null), (select id from countries where slug='belgique'), 'Atomium', 5000000, 'avril 2006', 4.5, 'https://monnaies-euros.com/images/2euros_comme_Belgique_2006.webp'),
  ((select id from commemorative_sets where year=2006 and name is null), (select id from countries where slug='finlande'), '100e anniversaire du suffrage universel et égalitaire', 2500000, 'octobre 2006', 4.8, 'https://monnaies-euros.com/images/2euros_comme_Finlande_2006.webp'),
  ((select id from commemorative_sets where year=2006 and name is null), (select id from countries where slug='italie'), 'XXe Jeux olympiques d''hiver - Turin 2006', 40000000, 'janvier 2006', 2.5, 'https://monnaies-euros.com/images/2euros_comme_Italie_2006.webp'),
  ((select id from commemorative_sets where year=2006 and name is null), (select id from countries where slug='luxembourg'), '25e anniversaire de l''héritier du trône, le Grand-Duc Guillaume', 1100000, 'janvier 2006', 4.2, 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2006.webp'),
  ((select id from commemorative_sets where year=2006 and name is null), (select id from countries where slug='saint-marin'), '500e anniversaire de la mort de Christophe Colomb', 120000, 'octobre 2006', 100.0, 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2006.webp'),
  ((select id from commemorative_sets where year=2006 and name is null), (select id from countries where slug='vatican'), '5e centenaire de la Garde suisse pontificale', 100000, 'novembre 2006', 180.0, 'https://monnaies-euros.com/images/2euros_comme_Vatican_2006.webp'),
  ((select id from commemorative_sets where year=2007 and name='50ème anniversaire du traité de Rome'), (select id from countries where slug='allemagne'), '50ème anniversaire du traité de Rome', 30865630, 'mars 2007', 2.2, 'https://monnaies-euros.com/images/2euros_comme2_Allemagne_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name='50ème anniversaire du traité de Rome'), (select id from countries where slug='autriche'), '50ème anniversaire du traité de Rome', 9000000, 'mars 2007', 2.8, 'https://monnaies-euros.com/images/2euros_comme_Autriche_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name='50ème anniversaire du traité de Rome'), (select id from countries where slug='belgique'), '50ème anniversaire du traité de Rome', 5040000, 'mars 2007', 4.0, 'https://monnaies-euros.com/images/2euros_comme_Belgique_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name='50ème anniversaire du traité de Rome'), (select id from countries where slug='espagne'), '50ème anniversaire du traité de Rome', 8000000, 'mars 2007', 3.8, 'https://monnaies-euros.com/images/2euros_comme_Espagne_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name='50ème anniversaire du traité de Rome'), (select id from countries where slug='finlande'), '50ème anniversaire du traité de Rome', 1400000, 'mars 2007', 4.5, 'https://monnaies-euros.com/images/2euros_comme2_Finlande_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name='50ème anniversaire du traité de Rome'), (select id from countries where slug='france'), '50ème anniversaire du traité de Rome', 9406875, 'mars 2007', 2.5, 'https://monnaies-euros.com/images/2euros_comme_France_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name='50ème anniversaire du traité de Rome'), (select id from countries where slug='grece'), '50ème anniversaire du traité de Rome', 3978549, 'mars 2007', 3.2, 'https://monnaies-euros.com/images/2euros_comme_Grece_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name='50ème anniversaire du traité de Rome'), (select id from countries where slug='irlande'), '50ème anniversaire du traité de Rome', 4640112, 'mars 2007', 3.4, 'https://monnaies-euros.com/images/2euros_comme_Irlande_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name='50ème anniversaire du traité de Rome'), (select id from countries where slug='italie'), '50ème anniversaire du traité de Rome', 5000000, 'mars 2007', 2.8, 'https://monnaies-euros.com/images/2euros_comme_Italie_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name='50ème anniversaire du traité de Rome'), (select id from countries where slug='luxembourg'), '50ème anniversaire du traité de Rome', 2046000, 'mars 2007', 3.8, 'https://monnaies-euros.com/images/2euros_comme2_Luxembourg_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name='50ème anniversaire du traité de Rome'), (select id from countries where slug='pays-bas'), '50ème anniversaire du traité de Rome', 6355500, 'mars 2007', 3.4, 'https://monnaies-euros.com/images/2euros_comme_PaysBas_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name='50ème anniversaire du traité de Rome'), (select id from countries where slug='portugal'), '50ème anniversaire du traité de Rome', 1520000, 'mars 2007', 4.2, 'https://monnaies-euros.com/images/2euros_comme2_Portugal_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name='50ème anniversaire du traité de Rome'), (select id from countries where slug='slovenie'), '50ème anniversaire du traité de Rome', 400000, 'mars 2007', 25.0, 'https://monnaies-euros.com/images/2euros_comme_Slovenie_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name is null), (select id from countries where slug='allemagne'), 'Mecklembourg-Poméranie occidentale', 30000000, 'février 2007', 2.2, 'https://monnaies-euros.com/images/2euros_comme_Allemagne_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name is null), (select id from countries where slug='finlande'), '90ème anniversaire de l''indépendance de la Finlande', 2000000, 'décembre 2007', 4.2, 'https://monnaies-euros.com/images/2euros_comme_Finlande_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name is null), (select id from countries where slug='luxembourg'), 'Palais grand-ducal', 1100000, 'février 2007', 4.1, 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name is null), (select id from countries where slug='monaco'), '25ème anniversaire de la mort de la Princesse Grace', 20000, 'juillet 2007', 2000.0, 'https://monnaies-euros.com/images/2euros_comme_Monaco_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name is null), (select id from countries where slug='portugal'), 'Présidence portugaise de l''Union européenne', 2000000, 'juillet 2007', 4.5, 'https://monnaies-euros.com/images/2euros_comme_Portugal_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name is null), (select id from countries where slug='saint-marin'), 'Bicentenaire de la naissance de Giuseppe Garibaldi', 130000, 'octobre 2007', 45.0, 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2007.webp'),
  ((select id from commemorative_sets where year=2007 and name is null), (select id from countries where slug='vatican'), '80ème anniversaire de Sa Sainteté le pape Benoît XVI', 100000, 'octobre 2007', 140.0, 'https://monnaies-euros.com/images/2euros_comme_Vatican_2007.webp'),
  ((select id from commemorative_sets where year=2008 and name is null), (select id from countries where slug='allemagne'), 'État fédéré de Hambourg', 30000000, 'février 2008', 2.2, 'https://monnaies-euros.com/images/2euros_comme_Allemagne_2008.webp'),
  ((select id from commemorative_sets where year=2008 and name='60e anniversaire de la Déclaration Universelle des Droits de l''Homme'), (select id from countries where slug='belgique'), '60e anniversaire de la Déclaration Universelle des Droits de l''Homme', 5000000, 'mai 2008', 3.8, 'https://monnaies-euros.com/images/2euros_comme_Belgique_2008.webp'),
  ((select id from commemorative_sets where year=2008 and name='60e anniversaire de la Déclaration Universelle des Droits de l''Homme'), (select id from countries where slug='finlande'), '60e anniversaire de la Déclaration Universelle des Droits de l''Homme', 1500000, 'octobre 2008', 4.5, 'https://monnaies-euros.com/images/2euros_comme_Finlande_2008.webp'),
  ((select id from commemorative_sets where year=2008 and name='60e anniversaire de la Déclaration Universelle des Droits de l''Homme'), (select id from countries where slug='italie'), '60e anniversaire de la Déclaration Universelle des Droits de l''Homme', 5000000, 'avril 2008', 2.8, 'https://monnaies-euros.com/images/2euros_comme_Italie_2008.webp'),
  ((select id from commemorative_sets where year=2008 and name='60e anniversaire de la Déclaration Universelle des Droits de l''Homme'), (select id from countries where slug='portugal'), '60e anniversaire de la Déclaration Universelle des Droits de l''Homme', 1000000, 'septembre 2008', 4.0, 'https://monnaies-euros.com/images/2euros_comme_Portugal_2008.webp'),
  ((select id from commemorative_sets where year=2008 and name is null), (select id from countries where slug='france'), 'Présidence française du Conseil de l''Union européenne au deuxie semestre 2008', 20000000, 'juillet 2008', 2.5, 'https://monnaies-euros.com/images/2euros_comme_France_2008.webp'),
  ((select id from commemorative_sets where year=2008 and name is null), (select id from countries where slug='luxembourg'), 'Grand-Duc Henri et château de Berg', 1300000, 'février 2008', 4.0, 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2008.webp'),
  ((select id from commemorative_sets where year=2008 and name is null), (select id from countries where slug='saint-marin'), 'Année européenne du Dialogue interculturel', 130000, 'avril 2008', 80.0, 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2008.webp'),
  ((select id from commemorative_sets where year=2008 and name is null), (select id from countries where slug='slovenie'), '500e anniversaire de la naissance de Primož Trubar', 1000000, 'mai 2008', 4.0, 'https://monnaies-euros.com/images/2euros_comme_Slovenie_2008.webp'),
  ((select id from commemorative_sets where year=2008 and name is null), (select id from countries where slug='vatican'), 'Année de saint Paul – bimillénaire de sa naissance', 100000, 'octobre 2008', 55.0, 'https://monnaies-euros.com/images/2euros_comme_Vatican_2008.webp'),
  ((select id from commemorative_sets where year=2009 and name='10ème anniversaire de l''Union économique et monétaire'), (select id from countries where slug='allemagne'), '10ème anniversaire de l''Union économique et monétaire', 30565630, 'janvier 2009', 2.2, 'https://monnaies-euros.com/images/2euros_comme2_Allemagne_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='10ème anniversaire de l''Union économique et monétaire'), (select id from countries where slug='autriche'), '10ème anniversaire de l''Union économique et monétaire', 5000000, 'janvier 2009', 3.1, 'https://monnaies-euros.com/images/2euros_comme_Autriche_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='10ème anniversaire de l''Union économique et monétaire'), (select id from countries where slug='belgique'), '10ème anniversaire de l''Union économique et monétaire', 5012000, 'janvier 2009', 3.5, 'https://monnaies-euros.com/images/2euros_comme2_Belgique_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='10ème anniversaire de l''Union économique et monétaire'), (select id from countries where slug='chypre'), '10ème anniversaire de l''Union économique et monétaire', 1000000, 'janvier 2009', 4.0, 'https://monnaies-euros.com/images/2euros_comme_Chypre_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='10ème anniversaire de l''Union économique et monétaire'), (select id from countries where slug='espagne'), '10ème anniversaire de l''Union économique et monétaire', 8000000, 'janvier 2009', 3.5, 'https://monnaies-euros.com/images/2euros_comme_Espagne_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='10ème anniversaire de l''Union économique et monétaire'), (select id from countries where slug='finlande'), '10ème anniversaire de l''Union économique et monétaire', 1400000, 'janvier 2009', 4.2, 'https://monnaies-euros.com/images/2euros_comme2_Finlande_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='10ème anniversaire de l''Union économique et monétaire'), (select id from countries where slug='france'), '10ème anniversaire de l''Union économique et monétaire', 10074085, 'janvier 2009', 2.5, 'https://monnaies-euros.com/images/2euros_comme_France_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='10ème anniversaire de l''Union économique et monétaire'), (select id from countries where slug='grece'), '10ème anniversaire de l''Union économique et monétaire', 4000000, 'janvier 2009', 3.2, 'https://monnaies-euros.com/images/2euros_comme_Grece_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='10ème anniversaire de l''Union économique et monétaire'), (select id from countries where slug='irlande'), '10ème anniversaire de l''Union économique et monétaire', 5000000, 'janvier 2009', 3.2, 'https://monnaies-euros.com/images/2euros_comme_Irlande_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='10ème anniversaire de l''Union économique et monétaire'), (select id from countries where slug='italie'), '10ème anniversaire de l''Union économique et monétaire', 2000000, 'janvier 2009', 3.4, 'https://monnaies-euros.com/images/2euros_comme2_Italie_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='10ème anniversaire de l''Union économique et monétaire'), (select id from countries where slug='luxembourg'), '10ème anniversaire de l''Union économique et monétaire', 825000, 'janvier 2009', 4.2, 'https://monnaies-euros.com/images/2euros_comme2_Luxembourg_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='10ème anniversaire de l''Union économique et monétaire'), (select id from countries where slug='malte'), '10ème anniversaire de l''Union économique et monétaire', 700000, 'janvier 2009', 4.5, 'https://monnaies-euros.com/images/2euros_comme_Malte_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='10ème anniversaire de l''Union économique et monétaire'), (select id from countries where slug='pays-bas'), '10ème anniversaire de l''Union économique et monétaire', 5313500, 'janvier 2009', 3.3, 'https://monnaies-euros.com/images/2euros_comme_PaysBas_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='10ème anniversaire de l''Union économique et monétaire'), (select id from countries where slug='portugal'), '10ème anniversaire de l''Union économique et monétaire', 1285000, 'janvier 2009', 3.9, 'https://monnaies-euros.com/images/2euros_comme2_Portugal_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='10ème anniversaire de l''Union économique et monétaire'), (select id from countries where slug='slovaquie'), '10ème anniversaire de l''Union économique et monétaire', 2500000, 'janvier 2009', 3.0, 'https://monnaies-euros.com/images/2euros_comme2_Slovaquie_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='10ème anniversaire de l''Union économique et monétaire'), (select id from countries where slug='slovenie'), '10ème anniversaire de l''Union économique et monétaire', 1000000, 'janvier 2009', 3.5, 'https://monnaies-euros.com/images/2euros_comme_Slovenie_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name is null), (select id from countries where slug='allemagne'), 'État fédéré de la Sarre', 30000000, 'février 2009', 2.2, 'https://monnaies-euros.com/images/2euros_comme_Allemagne_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='Bicentenaire de la naissance de Louis Braille'), (select id from countries where slug='belgique'), 'Bicentenaire de la naissance de Louis Braille', 5000000, 'septembre 2009', 3.5, 'https://monnaies-euros.com/images/2euros_comme_Belgique_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name='Bicentenaire de la naissance de Louis Braille'), (select id from countries where slug='italie'), 'Bicentenaire de la naissance de Louis Braille', 2000000, 'octobre 2009', 3.4, 'https://monnaies-euros.com/images/2euros_comme_Italie_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name is null), (select id from countries where slug='finlande'), '200ème anniversaire de l''autonomie de la Finlande et de la Diète de Porvoo', 1600000, 'octobre 2009', 4.0, 'https://monnaies-euros.com/images/2euros_comme_Finlande_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name is null), (select id from countries where slug='luxembourg'), 'Grand-Duc Henri et Grande-Duchesse Charlotte', 1400000, 'janvier 2009', 3.9, 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name is null), (select id from countries where slug='portugal'), 'Deuxième Jeux de la Lusophonie', 1250000, 'juin 2009', 3.9, 'https://monnaies-euros.com/images/2euros_comme_Portugal_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name is null), (select id from countries where slug='saint-marin'), 'Année européenne de la créativité et de l''innovation', 130000, 'mai 2009', 40.0, 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name is null), (select id from countries where slug='slovaquie'), '20ème anniversaire du jour de la liberté et de la démocratie (17 novembre 1989)', 1000000, 'novembre 2009', 3.5, 'https://monnaies-euros.com/images/2euros_comme_Slovaquie_2009.webp'),
  ((select id from commemorative_sets where year=2009 and name is null), (select id from countries where slug='vatican'), 'Année internationale de l''Astronomie', 106000, 'octobre 2009', 50.0, 'https://monnaies-euros.com/images/2euros_comme_Vatican_2009.webp'),
  ((select id from commemorative_sets where year=2010 and name is null), (select id from countries where slug='allemagne'), 'État fédéré de Brême', 30000000, 'janvier 2010', 2.2, 'https://monnaies-euros.com/images/2euros_comme_Allemagne_2010.webp'),
  ((select id from commemorative_sets where year=2010 and name is null), (select id from countries where slug='belgique'), 'Présidence belge du Conseil de l''Union européenne en 2010', 5000000, 'juin 2010', 3.2, 'https://monnaies-euros.com/images/2euros_comme_Belgique_2010.webp'),
  ((select id from commemorative_sets where year=2010 and name is null), (select id from countries where slug='espagne'), 'Centre historique de Cordoue – liste de l''héritage mondial de l''Unesco', 8000000, 'mars 2010', 3.5, 'https://monnaies-euros.com/images/2euros_comme_Espagne_2010.webp'),
  ((select id from commemorative_sets where year=2010 and name is null), (select id from countries where slug='finlande'), 'Décret monétaire de 1860 autorisant la Finlande à émettre des billets de banque et des pièces', 1600000, 'octobre 2010', 4.0, 'https://monnaies-euros.com/images/2euros_comme_Finlande_2010.webp'),
  ((select id from commemorative_sets where year=2010 and name is null), (select id from countries where slug='france'), '70e anniversaire de l''Appel du 18 juin', 20000000, 'juin 2010', 2.5, 'https://monnaies-euros.com/images/2euros_comme_France_2010.webp'),
  ((select id from commemorative_sets where year=2010 and name is null), (select id from countries where slug='grece'), '2 500e anniversaire de la bataille de Marathon', 2500000, 'octobre 2010', 3.5, 'https://monnaies-euros.com/images/2euros_comme_Grece_2010.webp'),
  ((select id from commemorative_sets where year=2010 and name is null), (select id from countries where slug='italie'), 'Bicentenaire de la naissance du comte de Cavour', 4000000, 'mars 2010', 2.9, 'https://monnaies-euros.com/images/2euros_comme_Italie_2010.webp'),
  ((select id from commemorative_sets where year=2010 and name is null), (select id from countries where slug='luxembourg'), 'Les armoiries du Grand-Duc', 1000000, 'janvier 2010', 3.9, 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2010.webp'),
  ((select id from commemorative_sets where year=2010 and name is null), (select id from countries where slug='portugal'), 'Centenaire de la République portugaise', 2000000, 'septembre 2010', 3.9, 'https://monnaies-euros.com/images/2euros_comme_Portugal_2010.webp'),
  ((select id from commemorative_sets where year=2010 and name is null), (select id from countries where slug='saint-marin'), '500e anniversaire de la mort de Sandro Botticelli', 130000, 'septembre 2010', 40.0, 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2010.webp'),
  ((select id from commemorative_sets where year=2010 and name is null), (select id from countries where slug='slovenie'), '200e anniversaire du jardin botanique de Ljubljana', 1000000, 'mai 2010', 3.5, 'https://monnaies-euros.com/images/2euros_comme_Slovenie_2010.webp'),
  ((select id from commemorative_sets where year=2010 and name is null), (select id from countries where slug='vatican'), 'Année des prêtres', 115000, 'octobre 2010', 45.0, 'https://monnaies-euros.com/images/2euros_comme_Vatican_2010.webp');
