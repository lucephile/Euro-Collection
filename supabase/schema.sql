-- ============================================================
-- Suivi Pièces Euro — schéma Supabase (PostgreSQL)
-- ============================================================

-- --- Référentiel pays --------------------------------------
create table countries (
  id serial primary key,
  name text not null,               -- "Belgique"
  slug text not null unique,        -- "belgique" (utilisé dans les URLs)
  iso_code text,                    -- "BE"
  flag_url text not null,
  first_year int,                   -- année d'entrée dans la zone euro
  sort_order int default 0
);

-- --- Séries par pays -----------------------------------------
-- Un pays peut avoir plusieurs séries de pièces "normales"
-- (ex: Belgique 1re série 1999-2007, 2e série 2008, etc.)
create table coin_series (
  id serial primary key,
  country_id int references countries(id) on delete cascade,
  label text not null,              -- "2e série (2008)"
  start_year int not null,
  end_year int,                     -- null = série toujours en cours
  sort_order int default 0
);

-- --- Valeurs de pièces (1c à 2€) -----------------------------
create type coin_value as enum ('1c','2c','5c','10c','20c','50c','1e','2e');

-- --- Une "pièce" = une case du grand tableau (série x valeur) -
create table pieces (
  id serial primary key,
  series_id int references coin_series(id) on delete cascade,
  value coin_value not null,
  image_url text not null,
  unique (series_id, value)
);

-- --- Pièces commémoratives 2€ ---------------------------------
create table commemorative_coins (
  id serial primary key,
  country_id int references countries(id) on delete cascade,
  year int not null,
  name text not null,               -- raison d'édition
  mintage bigint,                   -- nombre d'exemplaires
  issue_date text,                  -- "juin 2004" (texte libre, dates précises pas toujours connues)
  quotation numeric(10,2),          -- valeur marché estimée, nullable (v2)
  image_url text not null
);
create index on commemorative_coins (year);
create index on commemorative_coins (country_id);

-- --- Collection utilisateur -------------------------------------
-- possessed = true -> l'utilisateur a la pièce
-- (pas de ligne = pas encore renseigné, traité comme "non possédé" côté appli)
create table user_collection_pieces (
  user_id uuid references auth.users(id) on delete cascade,
  piece_id int references pieces(id) on delete cascade,
  possessed boolean not null default true,
  updated_at timestamptz default now(),
  primary key (user_id, piece_id)
);

create table user_collection_commemoratives (
  user_id uuid references auth.users(id) on delete cascade,
  commemorative_id int references commemorative_coins(id) on delete cascade,
  possessed boolean not null default true,
  updated_at timestamptz default now(),
  primary key (user_id, commemorative_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table countries enable row level security;
alter table coin_series enable row level security;
alter table pieces enable row level security;
alter table commemorative_coins enable row level security;
alter table user_collection_pieces enable row level security;
alter table user_collection_commemoratives enable row level security;

-- Référentiel : lecture publique, écriture réservée au rôle service (admin)
create policy "public read countries" on countries for select using (true);
create policy "public read series" on coin_series for select using (true);
create policy "public read pieces" on pieces for select using (true);
create policy "public read commemoratives" on commemorative_coins for select using (true);

-- Collection : chaque utilisateur ne voit / modifie que ses propres lignes
create policy "user reads own pieces collection" on user_collection_pieces
  for select using (auth.uid() = user_id);
create policy "user writes own pieces collection" on user_collection_pieces
  for insert with check (auth.uid() = user_id);
create policy "user updates own pieces collection" on user_collection_pieces
  for update using (auth.uid() = user_id);
create policy "user deletes own pieces collection" on user_collection_pieces
  for delete using (auth.uid() = user_id);

create policy "user reads own commem collection" on user_collection_commemoratives
  for select using (auth.uid() = user_id);
create policy "user writes own commem collection" on user_collection_commemoratives
  for insert with check (auth.uid() = user_id);
create policy "user updates own commem collection" on user_collection_commemoratives
  for update using (auth.uid() = user_id);
create policy "user deletes own commem collection" on user_collection_commemoratives
  for delete using (auth.uid() = user_id);

-- ============================================================
-- Profils publics + partage de collection par pseudo
-- ============================================================
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,     -- utilisé dans l'URL /sets/[username]
  is_public boolean not null default true,  -- collection visible publiquement ou non
  created_at timestamptz default now()
);
-- éviter les pseudos avec espaces/caractères pièges dans une URL
alter table profiles add constraint username_url_safe check (username ~ '^[a-z0-9_-]{3,30}$');

alter table profiles enable row level security;

-- Le pseudo (et lui seul) est public — pas d'email exposé
create policy "public read profiles" on profiles for select using (true);
create policy "user creates own profile" on profiles
  for insert with check (auth.uid() = user_id);
create policy "user updates own profile" on profiles
  for update using (auth.uid() = user_id);

-- Lecture publique de la collection SI le propriétaire a choisi is_public = true
-- (s'ajoute à la policy "own" existante, ne la remplace pas)
create policy "public read collection if profile public" on user_collection_pieces
  for select using (
    exists (select 1 from profiles p where p.user_id = user_collection_pieces.user_id and p.is_public)
  );

create policy "public read commem collection if profile public" on user_collection_commemoratives
  for select using (
    exists (select 1 from profiles p where p.user_id = user_collection_commemoratives.user_id and p.is_public)
  );
