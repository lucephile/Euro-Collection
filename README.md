# Suivi Pièces Euro — structure de départ

## Stack
- Next.js (App Router) + React
- Supabase (Postgres + Auth + RLS) — voir `supabase/schema.sql`
- Déploiement prévu sur Vercel (comme PizzaEval)

## Arborescence
```
app/
  layout.jsx        <- Header + Footer communs à TOUTES les pages (1 seul endroit à modifier)
  globals.css        <- palette (fond jaune pâle) + styles possédé/manquant
  page.jsx           <- landing page
  sets/page.jsx       <- tableau pièces Euro par pays (1c à 2€)
  commemoratives/page.jsx <- tableau 2€ commémoratives (année x pays)
  stats/page.jsx      <- statistiques utilisateur
  login/page.jsx      <- connexion / inscription (email + mdp)
components/
  Header.jsx          <- nav commune, menu burger en mobile
  Footer.jsx
  CoinCell.jsx        <- affichage d'une pièce (vert/rouge + tooltip infos)
  DisplayFilters.jsx  <- cases "cacher possédées" / "cacher manquantes"
lib/
  supabaseClient.js
supabase/
  schema.sql          <- tables + Row Level Security
```

## Comment lancer en local
1. Créer un projet sur https://supabase.com, exécuter `supabase/schema.sql` dans l'éditeur SQL
2. Copier `.env.example` en `.env.local` et renseigner `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `npm install`
4. `npm run dev`

## État actuel (structure uniquement)
- Toutes les pages utilisent des **données d'exemple en dur** (2 pays, 2 pièces commémoratives)
- Le clic sur une pièce change son statut visuellement mais **n'écrit pas encore en base** —
  prochaine étape : brancher `CoinCell` sur `user_collection_pieces` / `user_collection_commemoratives`
- L'auth Supabase est câblée sur la page login mais le Header n'affiche pas encore l'utilisateur connecté
- Optimisé mobile-first (menu burger, tableaux avec `overflow-x: auto`) — le responsive desktop
  affinera surtout les colonnes du tableau plutôt que de tout refaire

## Prochaines étapes possibles
1. Import des données réelles (pays, séries, pièces, commémoratives) dans Supabase — je peux
   générer les scripts SQL d'import une fois que tu me confirmes comment tu veux me fournir les
   données (ex: export CSV de ta copie locale, ou je scrape moi-même les pages country par country)
   -> total : 8 valeurs x ~25 pays/séries pour les sets, + ~400 pièces commémoratives 2004-2027
2. Brancher la collection utilisateur (lecture + écriture Supabase) sur CoinCell
3. Page "par année" (v2, collectionneurs avancés)
4. Champ quotation sur les commémoratives (v2)
5. Design/UI (une fois la structure validée)

## Partage de collection par pseudo (ajouté)
- À l'inscription, l'utilisateur choisit un pseudo unique (lettres minuscules/chiffres/tirets, 3-30 car.)
- `/sets/[username]` et `/commemoratives/[username]` affichent la collection de cet utilisateur
  en lecture seule (vert/rouge), sans connexion requise côté visiteur
- Contrôlé par `profiles.is_public` (vrai par défaut) — RLS Supabase autorise la lecture publique
  de la collection uniquement si le profil est public ; aucune donnée d'un profil privé n'est exposée
- Le format retenu est `/sets/pseudo` (segment d'URL) plutôt que `#pseudo` (fragment), qui n'est
  jamais transmis au serveur et ne peut donc pas être lu ni partagé de façon fiable

## Import des données réelles — sets Euro (ajouté)
- `supabase/import_sets.sql` : script d'import généré à partir du tableau de
  https://monnaies-euros.com/euros.php, parsé directement (pas de reconstruction manuelle des noms
  de fichiers, pour éviter les erreurs — le site a quelques incohérences de nommage, ex: Luxembourg 2e série)
- Contenu : 25 pays, 43 séries (gère les pays multi-séries : Belgique, Espagne, Finlande, France,
  Luxembourg, Monaco, Pays-Bas, Saint-Marin, Vatican), 344 pièces (43 séries x 8 valeurs)
- **Flags non incluses** : cette page source n'affiche pas les drapeaux, `flag_url` est laissé vide
  — à sourcer séparément (ex: table de drapeaux SVG par code ISO, déjà présent dans `countries.iso_code`)
- À exécuter après `schema.sql` dans l'éditeur SQL Supabase
- Prochaine étape : brancher `app/sets/page.jsx` sur ces vraies données au lieu du tableau d'exemple

## Page /sets branchée sur les vraies données (ajouté)
- `app/sets/page.jsx` interroge maintenant Supabase (`coin_series` + `countries` + `pieces`) au
  lieu des données d'exemple codées en dur — corrige l'affichage incomplet observé sur le déploiement Vercel
- Drapeaux : comme `countries.flag_url` n'est pas encore rempli (non fourni par la page source), la
  page utilise temporairement flagcdn.com par `iso_code` (déjà en base) — à remplacer si vous
  préférez des drapeaux hébergés en local
- Si la page affiche une erreur de chargement : vérifier que `schema.sql` PUIS `import_sets.sql`
  ont bien été exécutés dans l'éditeur SQL Supabase (dans cet ordre), et que
  `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont bien réglées dans les variables
  d'environnement du projet Vercel (Settings > Environment Variables), puis redéployer
- `/commemoratives` utilise encore des données d'exemple (2 pièces de 2004) — import réel des
  2€ commémoratives (2004-2027) à faire dans un prochain lot

## Corrections apportées (lot bugs/UX)
- **Redirection email "localhost"** : `signUp` envoie maintenant `emailRedirectTo` basé sur
  `window.location.origin`. **Action requise côté Supabase** : dans le dashboard Supabase >
  Authentication > URL Configuration, régler "Site URL" sur l'URL Vercel de prod et ajouter cette
  même URL (+ `/login`) dans "Redirect URLs" — sinon Supabase rejette la redirection personnalisée
  par sécurité et retombe sur localhost
- **Redirection après connexion** : `/login` redirige vers `/` (accueil) après un `signInWithPassword` réussi
- **Filtres "cacher"** : seule l'image disparaît désormais (`visibility: hidden` sur `<img>`), la
  cellule colorée (vert/rouge) reste visible pour garder la grille lisible
- **Agrandissement des pièces** : bouton loupe "+" en haut à droite de chaque image (visible au
  survol), ouvre l'image en grand dans une fenêtre modale — plus fiable qu'un simple survol sur mobile/tactile
- **Header dynamique** : `Header.jsx` gère maintenant lui-même l'état de connexion Supabase
  (`onAuthStateChange`) ; affiche "Mon profil" au lieu de "Connexion" une fois connecté
- **Nouvelle page `/account` ("Mon profil")** : email, pseudo, liens de partage
  `/sets/pseudo` et `/commemoratives/pseudo` en clair, déconnexion, et suppression de compte
- **Suppression de compte** : nécessite une route serveur (`app/api/delete-account/route.js`) car
  la suppression d'un utilisateur Supabase Auth requiert la clé `service_role`, jamais exposée au
  navigateur. **Nouvelle variable d'environnement à ajouter sur Vercel** :
  `SUPABASE_SERVICE_ROLE_KEY` (Supabase > Project Settings > API > service_role — à garder secrète,
  ne jamais utiliser `NEXT_PUBLIC_`). Le profil et toute la collection partent automatiquement avec
  le compte (`ON DELETE CASCADE` déjà en place dans `schema.sql`)

## Fix build cassé par SUPABASE_SERVICE_ROLE_KEY manquante
- `app/api/delete-account/route.js` créait le client Supabase admin au chargement du module :
  si la variable d'env était absente, ça faisait planter **tout le build Vercel**, pas juste cet
  endpoint. Le client est maintenant créé à l'intérieur du handler `POST`, avec un message
  d'erreur clair (500) si la clé manque, au lieu de casser le déploiement.
- Il reste nécessaire d'ajouter `SUPABASE_SERVICE_ROLE_KEY` sur Vercel pour que la suppression de
  compte fonctionne réellement (voir section précédente) — mais son absence ne bloque plus le site.

## Fix : la collection n'était pas sauvegardée (ajouté)
- `app/sets/page.jsx` ne faisait que changer l'affichage local — rien n'était écrit en base.
  Corrigé : chaque clic sur une pièce fait maintenant un `upsert`/`delete` réel dans
  `user_collection_pieces` (via les nouvelles fonctions `setPieceOwned` / `getOwnedPieces` de
  `lib/collectionData.js`), et la collection de l'utilisateur connecté est rechargée au
  chargement de la page — elle persiste donc bien en changeant de page ou en se reconnectant
- Mise à jour optimiste : le clic change la couleur immédiatement, puis annule visuellement si la
  sauvegarde échoue (ex. session expirée)
- Si l'utilisateur n'est pas connecté, cliquer sur une pièce redirige vers `/login` (un message
  l'indique aussi en haut de la page)
- `/commemoratives` utilise toujours des données d'exemple (pas d'IDs réels en base) — la
  persistance y sera branchée une fois l'import réel des commémoratives terminé

## Fix : création de compte cassée par la confirmation email (ajouté)
- **Cause racine** : `signUp()` ne crée pas de session tant que l'email n'est pas confirmé (si la
  confirmation email est activée sur le projet Supabase, ce qui est le cas ici). Le code
  précédent tentait d'insérer le profil (pseudo) juste après `signUp()`, sans session active — la
  RLS (`auth.uid() = user_id`) refusait donc l'écriture à chaque fois, quel que soit le pseudo.
  Le message d'erreur affiché ("pseudo déjà pris ou invalide") était trompeur : la vraie cause
  était l'absence de session, pas le pseudo lui-même.
- **Fix** : le pseudo choisi est stocké temporairement dans `user_metadata` lors de l'inscription
  (`options.data.username`). Une fois l'email confirmé (retour sur `/login` via le lien reçu par
  mail, qui ouvre automatiquement une session), `ensureProfile()` récupère ce pseudo et crée enfin
  la ligne `profiles` — cette fois avec une session active, donc la RLS l'autorise.
- Si la confirmation email est désactivée sur le projet Supabase (session immédiate au signup), le
  profil est créé tout de suite sans attendre — les deux cas sont gérés.

### Concernant le lien "Email link is invalid or has expired"
Deux causes possibles à vérifier :
1. **Site URL / Redirect URLs mal réglées dans Supabase** (Authentication > URL Configuration) —
   si l'URL de prod Vercel n'y figure pas exactement, la confirmation échoue. À vérifier en
   premier.
2. **Pré-clic automatique du lien par un scanner anti-phishing** (Outlook Safe Links, certains
   antivirus/proxys d'entreprise) : ces outils "cliquent" le lien avant vous pour vérifier qu'il
   est sûr, ce qui consomme le jeton à usage unique — quand vous cliquez ensuite, il est déjà
   expiré. C'est un problème connu avec les liens de confirmation Supabase. Solution si c'est le
   cas : passer par un flux où le lien mène à une page de confirmation avec un bouton à cliquer
   manuellement (pas une action déclenchée automatiquement au chargement), plutôt que le lien
   direct par défaut.

## Fix : /login redirigeait systématiquement vers l'accueil (ajouté)
- Le `useEffect` de détection "retour de confirmation email" redirigeait dès qu'une session
  Supabase existait, même en visite normale de `/login` par quelqu'un déjà connecté par ailleurs
  (session persistée en local) — la page devenait inutilisable.
- Corrigé : ne se déclenche plus que si l'URL contient réellement les paramètres envoyés par
  Supabase au retour du lien de confirmation (`access_token` dans le hash, ou `code=` en query).
  Une visite normale de `/login` n'est plus affectée, qu'une session existe ou non.

## Fix : pseudo introuvable pour les comptes créés avant le fix précédent (ajouté)
- Les comptes créés pendant les essais précédents (avant l'ajout du stockage du pseudo dans
  `user_metadata`) n'ont jamais eu de pseudo associé, et n'en auront jamais automatiquement —
  `ensureProfile()` ne fait rien s'il ne trouve pas de pseudo en attente.
- Ajout d'un formulaire directement sur `/account` ("Mon profil") : si aucun pseudo n'est associé
  au compte, un champ apparaît pour en choisir un et le valider immédiatement (fonctionne car
  l'utilisateur a déjà une session active sur cette page, donc la RLS autorise l'écriture).
- Si tu es dans ce cas : va sur "Mon profil" et choisis ton pseudo depuis ce nouveau formulaire —
  pas besoin de recréer un compte.

## Fix : /sets/[username] affichait encore l'ancien tableau d'exemple (ajouté)
- Quand `/sets` a été branchée sur les vraies données Supabase, la page publique
  `/sets/[username]` n'avait pas été mise à jour en parallèle et utilisait toujours les 2 pays
  d'exemple codés en dur — d'où la différence observée entre les deux pages.
- Corrigé : `/sets/[username]` interroge maintenant les mêmes tables (`coin_series` + `countries` +
  `pieces`) que `/sets`, en lecture seule, avec la collection du pseudo consulté.
- `/commemoratives/[username]` reste sur des données d'exemple pour l'instant, cohérent avec
  `/commemoratives` qui n'a pas encore reçu l'import réel des 2€ commémoratives.

## Import des 2€ commémoratives 2004-2006 + pages branchées (ajouté)
- `supabase/import_commemoratives.sql` : 21 pièces réelles (2004: 6, 2005: 8, 2006: 7), transcrites
  depuis https://monnaies-euros.com/euro2commemorative{2004,2005,2006}.php — nom, tirage, date
  d'émission, cotation et image. **À exécuter après `import_sets.sql`** (les pays doivent déjà
  exister). Les années 2007-2027 restent à faire (mises en pause pour l'instant, à la demande).
- `/commemoratives` et `/commemoratives/[username]` fonctionnent maintenant exactement comme les
  pages `/sets` équivalentes :
  - vraies données Supabase (plus de tableau d'exemple)
  - sauvegarde réelle de la collection (`user_collection_commemoratives`) avec mise à jour
    optimiste, et redirection vers `/login` si non connecté (page publique par pseudo inchangée,
    lecture seule)
  - drapeaux via flagcdn.com par pays
  - loupe/agrandissement et filtres "cacher" (déjà communs via `CoinCell` / `DisplayFilters`,
    aucune modif nécessaire de ce côté)
- Les colonnes (pays) et lignes (années) du tableau sont désormais générées dynamiquement à partir
  des données chargées, plutôt que codées en dur — elles s'étendront automatiquement au fur et à
  mesure de l'import des années suivantes

## Adaptation : regroupement par "set" (année + raison) + import 2007-2010 (ajouté)
Deux besoins adressés ensemble :
1. Un même pays peut avoir plusieurs pièces différentes la même année (ex: Allemagne 2007 a une
   pièce Länder ET une pièce Traité de Rome).
2. Une émission commune (même design, plusieurs pays — ex: Traité de Rome 2007, EMU 2009) doit
   apparaître sur une seule ligne "année - raison" plutôt que dispersée par pays.

**Nouvelle table `commemorative_sets`** (year + name, unique) : chaque ligne du tableau
`/commemoratives` correspond maintenant à un set, pas à une année brute. `commemorative_coins`
pointe vers son set via `set_id` (remplace les anciennes colonnes `year`/`name`, qui vivent
maintenant sur le set). Ceci résout les deux points : un pays avec 2 pièces la même année produit
simplement 2 sets différents (2 lignes), et un design commun à 16 pays reste 1 seul set (1 ligne)
avec une pièce par pays émetteur.

**Fichiers à exécuter dans Supabase, DANS CET ORDRE** (si `import_sets.sql` et l'ancien
`import_commemoratives.sql` 2004-2006 sont déjà en place) :
1. `supabase/migrate_commemorative_sets.sql` — crée `commemorative_sets`, convertit
   automatiquement les données 2004-2006 déjà importées (rien à ressaisir), nettoie l'ancien schéma
2. `supabase/import_commemoratives.sql` — **remplacé** : contient maintenant 2004 à 2010 au format
   sets (57 sets, 88 pièces au total). Si 2004-2006 est déjà migré par le script ci-dessus, ce
   fichier ajoute uniquement 2007-2010 grâce à `on conflict (year, name) do nothing` sur les sets —
   sûr à ré-exécuter.

**Pages mises à jour** : `/commemoratives` et `/commemoratives/[username]` interrogent maintenant
`commemorative_sets` (avec ses pièces imbriquées) au lieu de `commemorative_coins` directement.
Colonne "Année" devient "Année - Raison".

## Fix : une pièce par pays = une ligne par année, pas une ligne par pièce (ajouté)
Le premier découpage en "sets" groupait par (année, nom) — comme chaque pièce spécifique à un
seul pays a un nom unique, ça créait une ligne par pièce au lieu de regrouper toutes les pièces
"un seul pays" d'une même année sur une seule ligne.

**Nouvelle règle** : un set n'a une raison affichée ("année - raison") QUE s'il est partagé par
au moins 2 pays. Sinon, toutes les pièces "un seul pays émetteur" d'une année sont rassemblées
sur une ligne générique, étiquetée juste par l'année.

**À exécuter dans Supabase, dans cet ordre** (après migrate_commemorative_sets.sql +
import_commemoratives.sql déjà en place) :
1. `supabase/fix_generic_sets.sql` — fusionne les sets "un seul pays" par année, laisse intactes
   les éditions communes (Traité de Rome, EMU, etc.)
2. `supabase/add_coin_names.sql` — **important** : la 1ère migration avait supprimé le nom propre
   à chaque pièce (il ne vivait plus que sur le set). Ce script restaure une colonne `name` sur
   `commemorative_coins` et la remplit pièce par pièce (via l'URL d'image, identifiant stable),
   pour que l'info-bulle au survol affiche bien la bonne raison individuelle même sur les lignes
   génériques.

Le code (`/commemoratives` et `/commemoratives/[username]`) a été mis à jour en conséquence :
étiquette de ligne = "année - raison" seulement si `set.name` existe, sinon juste l'année ;
l'info-bulle au survol utilise désormais le nom propre de la pièce (`coin.name`), plus celui du
set (qui serait `null` ou trompeur sur les lignes génériques).

## Fix : repair_commemoratives.sql à bien exécuter (rappel)
Le tableau renvoyé après le fix précédent était identique — `supabase/repair_commemoratives.sql`
(qui corrige à la fois les doublons de pièces ET refait la fusion "1 pays -> 1 ligne/année") doit
être exécuté dans l'éditeur SQL Supabase si ce n'est pas déjà fait. Toutes ses étapes sont
idempotentes (sûr de le relancer plusieurs fois).

## Améliorations page /sets (ajouté)
- `supabase/fix_single_series_label.sql` : les pays à série unique affichent maintenant
  "1re série (2002-)" au lieu de juste "(2002-)", cohérent avec les pays multi-séries
- Le libellé de série passe systématiquement à la ligne sous le nom du pays/drapeau (lisibilité)
- Espacement réduit entre la colonne pays et les pièces (padding des cellules resserré)
- Pièces affichées plus grandes (colonnes 110px au lieu de 80px) et désormais **de taille
  uniforme** : chaque case pièce est un carré (`aspect-ratio: 1/1` + `object-fit: contain`) — les
  centimes et les euros ont maintenant tous la même taille de case, quelle que soit la taille
  réelle de l'image source (c'était la cause du problème signalé sur mobile)
- La loupe "+" pour agrandir reste inchangée et fonctionne toujours
- **Colonne pays et ligne d'en-tête (valeurs) fixes au scroll** : en scrollant horizontalement, le
  nom du pays reste visible à gauche ; en scrollant verticalement, la ligne des valeurs (1c, 2c…)
  reste visible en haut. Les deux pages `/sets` et `/sets/[username]` en profitent.

## Fix : repair_commemoratives.sql échouait sur une contrainte (ajouté)
La normalisation des apostrophes (étape 1) entrait en collision avec la contrainte d'unicité
`(year, name)` avant même d'avoir pu fusionner les doublons — c'est justement cette collision
qu'on cherche à résoudre. Le script retire maintenant la contrainte au début, fait tout le
nettoyage, puis la remet en place avant l'étape de fusion "1 pays -> ligne générique".

## Réinitialisation complète des commémoratives (ajouté)
Après plusieurs échecs de migration incrémentale (contraintes, doublons résiduels), repartir de
zéro s'est avéré plus fiable. `supabase/reset_commemoratives.sql` supprime et recrée
`commemorative_sets` + `commemorative_coins` avec la structure finale correcte dès le départ (sets
nommés pour les éditions >= 2 pays, set générique par année sinon), puis réinsère les 88 pièces
2004-2010 déjà correctement réparties. Remplace tous les scripts de migration précédents
(migrate_commemorative_sets.sql, fix_generic_sets.sql, add_coin_names.sql, repair_commemoratives.sql
— obsolètes, à ignorer si le site est reparti sur cette base propre).

## Lisibilité : raison sur sa propre ligne, plus petite, non grasse (ajouté)
Dans la colonne "Année - Raison" de `/commemoratives` et `/commemoratives/[username]`, la raison
passe maintenant systématiquement à la ligne sous l'année, en texte plus petit (12px) et normal
(non gras) — l'année reste seule en gras. Corrige au passage `/commemoratives/[username]` qui
n'affichait pas encore la même version corrigée (année seule sans " - " pour les lignes
génériques) que `/commemoratives`.

## Pièces 2€ agrandies x2.5 (ajouté)
Cellules de `/commemoratives` et `/commemoratives/[username]` passées de 100px à 250px de large
(×2.5, comme demandé) — les images de pièces (carrées, `object-fit: contain`) suivent
automatiquement la taille de leur cellule.

## Fix : Braille (2009) n'est pas une vraie édition commune (ajouté)
- `supabase/fix_braille_set.sql` : déplace la pièce Louis Braille (Belgique + Italie, 2009) vers la
  ligne générique 2009 — ce n'était qu'une coïncidence de nom, pas une édition coordonnée.
- **Règle définitive pour les prochains imports (2011-2027)** : seules ces éditions ont leur propre
  ligne, quel que soit le nombre de pays qui partagent le nom :
  - 2007 - 50ème anniversaire du traité de Rome
  - 2009 - 10ème anniversaire de l'Union économique et monétaire
  - 2012 - 10 ans de l'euro
  - 2015 - 30 ans du drapeau européen
  - 2022 - 30 ans Erasmus
  Toute autre pièce va sur la ligne générique de son année, même en cas de coïncidence de nom
  entre pays. Le générateur d'import devra utiliser cette liste blanche au lieu de grouper
  automatiquement par (année, nom) partagé par ≥ 2 pays.

## Fix complémentaire : "60e anniversaire de la Déclaration Universelle des Droits de l'Homme" (2008)
Même correction que Braille : ce n'est pas non plus dans la liste exhaustive des vraies éditions
communes, donc coïncidence de nom (Belgique, Finlande, Italie, Portugal) -> ligne générique 2008.
Fichier renommé `supabase/fix_coincidental_sets.sql` (couvre maintenant les deux cas identifiés
dans les données 2004-2010 déjà importées).

## Améliorations /commemoratives alignées sur /sets (ajouté)
Mêmes améliorations que sur `/sets` appliquées à `/commemoratives` et `/commemoratives/[username]` :
- Colonne "Année - Raison" fixe à gauche au scroll horizontal
- Ligne des drapeaux fixe en haut au scroll vertical
- Pièces agrandies de 20% supplémentaires (250px -> 300px, soit x3 par rapport à la taille d'origine)
Réutilise les mêmes règles CSS que `/sets` (classe `.sets-table`), donc pas de nouveau code à
maintenir en double.

## Import 2011-2015 (ajouté)
`supabase/import_commemoratives_2011_2015.sql` : 143 pièces (2011: 16, 2012: 30, 2013: 23,
2014: 27, 2015: 47), en appliquant strictement la liste blanche exhaustive des vraies éditions
communes (fournie par l'utilisateur) plutôt qu'un regroupement automatique par nom partagé :
- 2012 "Dix ans de l'euro" et 2015 "30e anniversaire du drapeau européen" obtiennent leur ligne dédiée
- Toute autre coïncidence de nom entre pays (il n'y en a pas eu dans ce lot, mais la règle
  s'applique) resterait sur la ligne générique de son année
Script idempotent (on conflict do nothing sur sets et pièces). À exécuter après
reset_commemoratives.sql (2004-2010).

## Lot d'améliorations (ajouté)

### Tailles de pièces responsive (min/max au lieu de fixe)
`table-layout: fixed` était déjà en place mais avec des valeurs strictement fixes (aucune marge de
manœuvre selon la taille d'écran). Remplacé par `clamp()` :
- `/sets` (`.coin-col`) : entre 70px et 140px (10% de la largeur d'écran entre les deux)
- `/commemoratives` (`.coin-col-commem`) : entre 90px et 300px (14% de la largeur d'écran)
- Colonne pays/année (première colonne) : entre 140px et 220px
Valeurs à ajuster ensemble si besoin — dis-moi si un des paliers ne convient pas.

### En-têtes de colonnes /sets remplacés par des images
`lib/constants.js` centralise l'URL de base des images (`COIN_IMAGES_BASE`, pointant vers le repo
`euro-coin-images`). Les en-têtes "1c", "2c"... de `/sets` et `/sets/[username]` affichent
maintenant une image plutôt qu'un texte, chargée depuis :
`{COIN_IMAGES_BASE}/headers/{valeur}.webp` — donc 8 fichiers à uploader dans un dossier
`headers/` à la racine du repo `euro-coin-images` : `1c.webp`, `2c.webp`, `5c.webp`, `10c.webp`,
`20c.webp`, `50c.webp`, `1e.webp`, `2e.webp`.

### Nouvelle page /country ("Explorer par pays")
Sélecteur de pays (menu déroulant) ; une fois choisi, affiche sur une seule page : le tableau de
ses séries de pièces Euro (mêmes composants que `/sets`, filtré à ce pays), puis en dessous la
liste de ses 2€ commémoratives triées par année, avec sauvegarde de collection identique aux
autres pages (clic pour marquer possédée/non possédée, redirection connexion si besoin). Lien
ajouté dans le menu de navigation ("Explorer par pays").

## Fix : /country lecture seule + affichage /commemoratives (ajouté)
- `/country` : retiré la possibilité de cliquer pour cocher/décocher (à la fois sur le tableau de
  sets et sur la liste des commémoratives) — cette page reste purement une vue d'ensemble en
  lecture seule ; la gestion de la collection reste sur `/sets` et `/commemoratives`
- `/commemoratives` et `/commemoratives/[username]` : nouvelle classe `commem-table` pour un
  espacement vertical plus généreux (14px au lieu de 4px) et des pièces plus grandes au minimum
  (120px au lieu de 90px, jusqu'à 300px comme avant) — corrige le rendu tassé signalé

## Fix : colonnes écrasées au lieu de déborder avec scroll (ajouté)
Bug identifié : `width: "100%"` était posé sur les `<table>` elles-mêmes (`/sets`,
`/commemoratives` et leurs variantes `[username]`), ce qui forçait `table-layout: fixed` à
répartir proportionnellement toutes les colonnes pour qu'elles tiennent exactement dans l'écran —
écrasant les tailles minimales définies via `clamp()`, d'où l'affichage tassé avec plein d'espace
inutilisé signalé. Retiré `width: "100%"` : le tableau prend maintenant sa largeur naturelle (somme
des largeurs de colonnes), et le conteneur (`overflowX: "auto"`, déjà en place) fait apparaître une
barre de défilement horizontale dès que ça dépasse — plus besoin de coder un slider, le
comportement standard du navigateur s'en charge.

## Fix (suite) : le tableau ne s'étendait toujours pas (ajouté)
Retirer `width: "100%"` seul n'a pas suffi — le comportement de `table-layout: fixed` avec
`width: auto` reste ambigu/dépendant du navigateur pour forcer un tableau à dépasser son
conteneur. Remplacé par `width: "max-content"`, qui force explicitement le tableau à prendre sa
taille naturelle (somme des largeurs de colonnes `clamp()`), quel que soit le navigateur —
garantit que chaque pièce garde bien sa taille minimale et que le défilement horizontal
apparaît dès que ça dépasse, sur `/sets`, `/commemoratives`, `/country` et leurs variantes
`[username]`.

## Fix : taille des pièces (commémoratives) + largeur de page (ajouté)
- `.coin-col-commem` : taille fixe 100x100px (au lieu d'une plage `clamp()` qui montait jusqu'à
  300px) — suffisant maintenant que les vraies images des pièces s'affichent correctement
- `.container` (largeur générale du site) : `max-width` retiré (était 1100px, plafonnait toutes
  les pages sur grand écran avec de larges marges vides inutilisées, visible notamment sur
  `/commemoratives` avec son tableau large) — le site utilise maintenant toute la largeur
  disponible de l'écran

## Fix : double scroll + collection croisée entre pays sur /country (ajouté)

### Double barre de défilement vertical
Les conteneurs de tableau (`/sets`, `/commemoratives`) avaient `maxHeight: "80vh" + overflowY:
"auto"`, créant une zone de défilement interne séparée de celle de la page — d'où l'utilisateur
parfois "piégé" à ne faire défiler que les pièces sans atteindre le bas du site. Retiré : le
défilement vertical passe maintenant entièrement par la page (le défilement horizontal, lui,
reste local au tableau via `overflowX: "auto"`, inchangé). Les colonnes/lignes fixes (sticky)
continuent de fonctionner normalement, simplement ancrées à la fenêtre plutôt qu'à une zone interne.

### Bug : mauvais statut possédé/non-possédé selon le pays sur /country
Cause : `pieces.id` (sets) et `commemorative_coins.id` (commémoratives) sont deux séquences
auto-incrémentées indépendantes qui peuvent parfaitement tomber sur le même nombre. Le code
fusionnait les deux dans un seul objet `owned` — une pièce de set n°42 possédée pouvait donc faire
apparaître comme "possédée" une pièce commémorative n°42 d'un tout autre pays, non réellement
possédée. Corrigé : deux états séparés (`ownedPieces` / `ownedCommems`), chacun utilisé au bon
endroit — plus de collision possible entre les deux tables.

## Barre de défilement horizontale permanente + noms de pays natifs (ajouté)

### Barre de défilement toujours accessible
Nouveau composant `components/TableScrollWrapper.jsx` : ajoute une seconde barre de défilement
fine, synchronisée avec le tableau, collée en bas de l'écran (`position: sticky`) tant que le
tableau reste visible — plus besoin de descendre tout en bas d'une page très longue pour pouvoir
défiler horizontalement. Utilisé sur `/sets`, `/sets/[username]`, `/commemoratives` et
`/commemoratives/[username]`.
(Nettoyage au passage : un composant redondant `HScrollSync.jsx`, créé par erreur plus tôt dans la
même session, a été supprimé au profit de celui-ci.)

### Nom des pays dans leur langue d'origine
`lib/constants.js` contient maintenant `NATIVE_NAMES` (ex: allemagne → "Deutschland"). Affiché en
petit sous le drapeau, sous le nom français, dans l'en-tête de colonne de `/commemoratives` et
`/commemoratives/[username]`.

### Bandeau de nav + en-tête de tableau fixes (déjà en place)
Vérifié que ces deux points, demandés dans ce même message, étaient déjà implémentés lors d'un
tour précédent : le bandeau de navigation est `position: sticky; top: 0` sur toutes les pages, et
l'en-tête du tableau (valeurs/drapeaux) est fixé juste en dessous (`top: 57px`, soit la hauteur du
bandeau) plutôt que de s'y superposer.

## Fix : sticky header coupé + double scrollbar + taille noms de pays (ajouté)

### En-tête de tableau coupé/comportement sticky cassé
Cause trouvée : `overflow-x: auto` sur la zone de tableau force implicitement `overflow-y` à
`auto` si non précisé (comportement standard CSS) — ça créait sans le vouloir un nouveau contexte
de défilement vertical propre à cette zone, cassant la référence utilisée par `position: sticky`
pour la ligne d'en-tête (valeurs/pièces), d'où le rendu coupé observé après les dernières
modifications. Corrigé : `overflowY: "visible"` explicite dans `TableScrollWrapper` — l'en-tête
(zone verte de ton schéma) se fixe maintenant correctement juste sous le bandeau de nav pendant que
les lignes de pays défilent en dessous, exactement comme voulu.

### Barre de défilement horizontale en double
La barre native du navigateur (au bas de la zone de tableau elle-même) restait visible en plus de
la nouvelle barre synchronisée collée à l'écran. Masquée via CSS (`.hide-native-scrollbar`,
cross-navigateurs) — seule la barre synchronisée reste visible, la zone garde sa capacité de
défilement normalement (juste sans double affichage).

### Drapeaux et noms de pays agrandis (/commemoratives)
Doublés comme demandé : drapeaux de 20px à 40px, texte de 10px à 20px. Les noms les plus longs
(ex: Belgique dans ses 3 langues) passeront sur plusieurs lignes dans la cellule — signale si la
largeur de colonne doit aussi être ajustée en conséquence.

## Fix définitif : en-tête fixe + défilement horizontal (ajouté)
Le fix précédent (`overflowY: "visible"`) n'avait aucun effet réel : en CSS, dès qu'un axe
(`overflow-x`) passe à une valeur autre que `visible`, l'autre axe est automatiquement forcé à
`auto` en interne — même écrit "visible" explicitement, impossible d'empêcher ce comportement.
Ça cassait la référence utilisée par `position: sticky` pour la ligne d'en-tête.

**Solution définitive** : `TableScrollWrapper` sépare maintenant l'en-tête et le corps du tableau
en deux `<table>` distincts (technique standard des grilles de données avec en-tête fixe) :
- L'en-tête (`headerRow`) vit dans un `<div>` séparé, fixé sous le bandeau de nav
  (`position: sticky; top: 57px`), sans défilement propre
- Le corps (les lignes) défile horizontalement normalement
- Les deux, plus la barre de défilement collée en bas, sont synchronisés en JavaScript
  (`scrollLeft` répercuté entre les trois)

Toutes les pages concernées (`/sets`, `/sets/[username]`, `/commemoratives`,
`/commemoratives/[username]`) ont été adaptées pour passer leur ligne d'en-tête via la nouvelle
prop `headerRow`, et leurs lignes de données directement en enfants du composant.

## Fix : alignement en-tête/colonnes + centrage + colonne Année responsive (ajouté)
- **Désalignement pays/colonnes sur /commemoratives** : cause — l'en-tête et le corps du tableau
  étant maintenant deux `<table>` distinctes, chacune calcule sa propre largeur de colonne
  indépendamment (`table-layout: fixed`) ; l'en-tête n'avait pas la classe `coin-col-commem` fixant
  100px, donc il se dimensionnait selon son propre contenu (drapeaux + texte agrandis). Ajouté la
  classe manquante sur les `<th>` pays.
- **"—" centrés** : `text-align: center` ajouté aux classes `.coin-col` et `.coin-col-commem`.
- **Colonne "Année - Raison" plus étroite sur mobile** : largeur minimale réduite (90px au lieu de
  140px, spécifique à `/commemoratives` via `.commem-table`, sans toucher `/sets`) ; le
  `white-space: nowrap` qui empêchait le retour à la ligne a été retiré — les raisons longues
  (éditions communes) passent maintenant sur plusieurs lignes au lieu d'élargir la colonne.
- `supabase/shorten_uem_name.sql` : raccourcit "10ème anniversaire de l'Union économique et
  monétaire" en "10ème anniversaire de l'UEM" — à exécuter dans Supabase.

## Fix : désalignement mobile + retour à la ligne fiable (ajouté)
Cause commune aux deux problèmes signalés : la largeur de la colonne "Année - Raison" utilisait
`clamp()` avec une unité `vw` (pourcentage de la largeur d'écran). Comme l'en-tête et le corps du
tableau sont deux `<table>` séparées calculées indépendamment, de légers écarts d'arrondi entre les
deux ont fini par désaligner les colonnes suivantes (Vatican sorti de l'écran sur mobile) — et la
largeur réellement obtenue restait parfois trop large pour forcer le retour à la ligne des raisons
longues. Remplacé par une largeur fixe stricte de 110px (aucune unité `vw`), identique des deux
côtés — garantit l'alignement pixel-parfait et un retour à la ligne fiable et prévisible pour :
2007 (Traité de Rome), 2009 (UEM), 2012 (Dix ans de l'euro), 2015 (drapeau européen), 2022
(Erasmus).

Pour "2009 - 10ème anniversaire de l'UEM" : c'est une donnée en base, pas du code — le script
`supabase/shorten_uem_name.sql` (déjà fourni) fait exactement ce raccourci ; à exécuter dans
Supabase s'il ne l'a pas encore été.
