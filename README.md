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
