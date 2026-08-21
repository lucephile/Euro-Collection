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
