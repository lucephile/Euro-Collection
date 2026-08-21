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
