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
