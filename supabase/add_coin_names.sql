-- ============================================================
-- Restaure le nom/raison propre à CHAQUE pièce (perdu lors de la
-- première migration, où il ne vivait plus que sur le set).
-- Nécessaire pour l'info-bulle au survol des pièces "génériques"
-- (un seul pays émetteur) une fois regroupées par année.
-- À exécuter APRÈS fix_generic_sets.sql.
-- ============================================================

alter table commemorative_coins add column if not exists name text;

-- Backfill par image_url (identifiant stable et unique par pièce)
update commemorative_coins set name = 'Elargissement de l''Union européenne à dix nouveaux États membres' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Finlande_2004.webp';
update commemorative_coins set name = 'Jeux olympiques d''Athènes de 2004' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Grece_2004.webp';
update commemorative_coins set name = '50ème anniversaire du Programme alimentaire mondial' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Italie_2004.webp';
update commemorative_coins set name = 'Effigie et monogramme du Grand-Duc Henri' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2004.webp';
update commemorative_coins set name = 'Bartolomeo Borghesi (historien, numismate)' where image_url = 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2004.webp';
update commemorative_coins set name = '75ème anniversaire de la fondation de l''État de la Cité du Vatican' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Vatican_2004.webp';
update commemorative_coins set name = '50e anniversaire du Traité d''État autrichien' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Autriche_2005.webp';
update commemorative_coins set name = 'Union économique belgo-luxembourgeoise' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Belgique_2005.webp';
update commemorative_coins set name = '4e centenaire de la première édition de « L''ingénieux hidalgo Don Quichotte de la Manche » de Miguel de Cervantes' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Espagne_2005.webp';
update commemorative_coins set name = '60e anniversaire des Nations unies et 50e anniversaire de l''adhésion de la Finlande aux Nations unies' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Finlande_2005.webp';
update commemorative_coins set name = '1er anniversaire de la signature de la Constitution européenne' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Italie_2005.webp';
update commemorative_coins set name = '50e anniversaire du Grand-Duc Henri, 5e anniversaire de son accession au trône et centenaire de la mort du Grand-Duc Adolphe' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2005.webp';
update commemorative_coins set name = '2005, année mondiale de la physique' where image_url = 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2005.webp';
update commemorative_coins set name = '20e Journées mondiales de la jeunesse' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Vatican_2005.webp';
update commemorative_coins set name = 'Schleswig-Holstein' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Allemagne_2006.webp';
update commemorative_coins set name = 'Atomium' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Belgique_2006.webp';
update commemorative_coins set name = '100e anniversaire du suffrage universel et égalitaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Finlande_2006.webp';
update commemorative_coins set name = 'XXe Jeux olympiques d''hiver - Turin 2006' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Italie_2006.webp';
update commemorative_coins set name = '25e anniversaire de l''héritier du trône, le Grand-Duc Guillaume' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2006.webp';
update commemorative_coins set name = '500e anniversaire de la mort de Christophe Colomb' where image_url = 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2006.webp';
update commemorative_coins set name = '5e centenaire de la Garde suisse pontificale' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Vatican_2006.webp';
update commemorative_coins set name = '50ème anniversaire du traité de Rome' where image_url = 'https://monnaies-euros.com/images/2euros_comme2_Allemagne_2007.webp';
update commemorative_coins set name = 'Mecklembourg-Poméranie occidentale' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Allemagne_2007.webp';
update commemorative_coins set name = '50ème anniversaire du traité de Rome' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Autriche_2007.webp';
update commemorative_coins set name = '50ème anniversaire du traité de Rome' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Belgique_2007.webp';
update commemorative_coins set name = '50ème anniversaire du traité de Rome' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Espagne_2007.webp';
update commemorative_coins set name = '90ème anniversaire de l''indépendance de la Finlande' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Finlande_2007.webp';
update commemorative_coins set name = '50ème anniversaire du traité de Rome' where image_url = 'https://monnaies-euros.com/images/2euros_comme2_Finlande_2007.webp';
update commemorative_coins set name = '50ème anniversaire du traité de Rome' where image_url = 'https://monnaies-euros.com/images/2euros_comme_France_2007.webp';
update commemorative_coins set name = '50ème anniversaire du traité de Rome' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Grece_2007.webp';
update commemorative_coins set name = '50ème anniversaire du traité de Rome' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Irlande_2007.webp';
update commemorative_coins set name = '50ème anniversaire du traité de Rome' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Italie_2007.webp';
update commemorative_coins set name = 'Palais grand-ducal' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2007.webp';
update commemorative_coins set name = '50ème anniversaire du traité de Rome' where image_url = 'https://monnaies-euros.com/images/2euros_comme2_Luxembourg_2007.webp';
update commemorative_coins set name = '25ème anniversaire de la mort de la Princesse Grace' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Monaco_2007.webp';
update commemorative_coins set name = '50ème anniversaire du traité de Rome' where image_url = 'https://monnaies-euros.com/images/2euros_comme_PaysBas_2007.webp';
update commemorative_coins set name = 'Présidence portugaise de l''Union européenne' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Portugal_2007.webp';
update commemorative_coins set name = '50ème anniversaire du traité de Rome' where image_url = 'https://monnaies-euros.com/images/2euros_comme2_Portugal_2007.webp';
update commemorative_coins set name = 'Bicentenaire de la naissance de Giuseppe Garibaldi' where image_url = 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2007.webp';
update commemorative_coins set name = '50ème anniversaire du traité de Rome' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Slovenie_2007.webp';
update commemorative_coins set name = '80ème anniversaire de Sa Sainteté le pape Benoît XVI' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Vatican_2007.webp';
update commemorative_coins set name = 'État fédéré de Hambourg' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Allemagne_2008.webp';
update commemorative_coins set name = '60e anniversaire de la Déclaration Universelle des Droits de l''Homme' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Belgique_2008.webp';
update commemorative_coins set name = '60e anniversaire de la Déclaration Universelle des Droits de l''Homme' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Finlande_2008.webp';
update commemorative_coins set name = 'Présidence française du Conseil de l''Union européenne au deuxie semestre 2008' where image_url = 'https://monnaies-euros.com/images/2euros_comme_France_2008.webp';
update commemorative_coins set name = '60e anniversaire de la Déclaration Universelle des Droits de l''Homme' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Italie_2008.webp';
update commemorative_coins set name = 'Grand-Duc Henri et château de Berg' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2008.webp';
update commemorative_coins set name = '60e anniversaire de la Déclaration Universelle des Droits de l''Homme' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Portugal_2008.webp';
update commemorative_coins set name = 'Année européenne du Dialogue interculturel' where image_url = 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2008.webp';
update commemorative_coins set name = '500e anniversaire de la naissance de Primož Trubar' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Slovenie_2008.webp';
update commemorative_coins set name = 'Année de saint Paul – bimillénaire de sa naissance' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Vatican_2008.webp';
update commemorative_coins set name = '10ème anniversaire de l''Union économique et monétaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme2_Allemagne_2009.webp';
update commemorative_coins set name = 'État fédéré de la Sarre' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Allemagne_2009.webp';
update commemorative_coins set name = '10ème anniversaire de l''Union économique et monétaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Autriche_2009.webp';
update commemorative_coins set name = 'Bicentenaire de la naissance de Louis Braille' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Belgique_2009.webp';
update commemorative_coins set name = '10ème anniversaire de l''Union économique et monétaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme2_Belgique_2009.webp';
update commemorative_coins set name = '10ème anniversaire de l''Union économique et monétaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Chypre_2009.webp';
update commemorative_coins set name = '10ème anniversaire de l''Union économique et monétaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Espagne_2009.webp';
update commemorative_coins set name = '10ème anniversaire de l''Union économique et monétaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme2_Finlande_2009.webp';
update commemorative_coins set name = '200ème anniversaire de l''autonomie de la Finlande et de la Diète de Porvoo' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Finlande_2009.webp';
update commemorative_coins set name = '10ème anniversaire de l''Union économique et monétaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme_France_2009.webp';
update commemorative_coins set name = '10ème anniversaire de l''Union économique et monétaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Grece_2009.webp';
update commemorative_coins set name = '10ème anniversaire de l''Union économique et monétaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Irlande_2009.webp';
update commemorative_coins set name = 'Bicentenaire de la naissance de Louis Braille' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Italie_2009.webp';
update commemorative_coins set name = '10ème anniversaire de l''Union économique et monétaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme2_Italie_2009.webp';
update commemorative_coins set name = 'Grand-Duc Henri et Grande-Duchesse Charlotte' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2009.webp';
update commemorative_coins set name = '10ème anniversaire de l''Union économique et monétaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme2_Luxembourg_2009.webp';
update commemorative_coins set name = '10ème anniversaire de l''Union économique et monétaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Malte_2009.webp';
update commemorative_coins set name = '10ème anniversaire de l''Union économique et monétaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme_PaysBas_2009.webp';
update commemorative_coins set name = 'Deuxième Jeux de la Lusophonie' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Portugal_2009.webp';
update commemorative_coins set name = '10ème anniversaire de l''Union économique et monétaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme2_Portugal_2009.webp';
update commemorative_coins set name = 'Année européenne de la créativité et de l''innovation' where image_url = 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2009.webp';
update commemorative_coins set name = '20ème anniversaire du jour de la liberté et de la démocratie (17 novembre 1989)' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Slovaquie_2009.webp';
update commemorative_coins set name = '10ème anniversaire de l''Union économique et monétaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme2_Slovaquie_2009.webp';
update commemorative_coins set name = '10ème anniversaire de l''Union économique et monétaire' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Slovenie_2009.webp';
update commemorative_coins set name = 'Année internationale de l''Astronomie' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Vatican_2009.webp';
update commemorative_coins set name = 'État fédéré de Brême' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Allemagne_2010.webp';
update commemorative_coins set name = 'Présidence belge du Conseil de l''Union européenne en 2010' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Belgique_2010.webp';
update commemorative_coins set name = 'Centre historique de Cordoue – liste de l''héritage mondial de l''Unesco' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Espagne_2010.webp';
update commemorative_coins set name = 'Décret monétaire de 1860 autorisant la Finlande à émettre des billets de banque et des pièces' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Finlande_2010.webp';
update commemorative_coins set name = '70e anniversaire de l''Appel du 18 juin' where image_url = 'https://monnaies-euros.com/images/2euros_comme_France_2010.webp';
update commemorative_coins set name = '2 500e anniversaire de la bataille de Marathon' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Grece_2010.webp';
update commemorative_coins set name = 'Bicentenaire de la naissance du comte de Cavour' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Italie_2010.webp';
update commemorative_coins set name = 'Les armoiries du Grand-Duc' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Luxembourg_2010.webp';
update commemorative_coins set name = 'Centenaire de la République portugaise' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Portugal_2010.webp';
update commemorative_coins set name = '500e anniversaire de la mort de Sandro Botticelli' where image_url = 'https://monnaies-euros.com/images/2euros_comme_SaintMarin_2010.webp';
update commemorative_coins set name = '200e anniversaire du jardin botanique de Ljubljana' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Slovenie_2010.webp';
update commemorative_coins set name = 'Année des prêtres' where image_url = 'https://monnaies-euros.com/images/2euros_comme_Vatican_2010.webp';

alter table commemorative_coins alter column name set not null;
