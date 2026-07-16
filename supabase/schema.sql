-- Run this in the Supabase SQL editor (or via `supabase db push`).
create table if not exists ranking (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  score integer not null,
  accuracy numeric(5, 1) not null,
  combo integer not null,
  hps numeric(6, 2) not null default 0,
  base integer not null check (base between 2 and 16),
  created_at timestamptz not null default now()
);

-- Boards are per-base: the weekly list filters on (base, created_at) and
-- the all-time-best row filters on (base, score).
create index if not exists ranking_base_created_at_idx on ranking (base, created_at desc);
create index if not exists ranking_base_score_idx on ranking (base, score desc);
create index if not exists ranking_player_name_idx on ranking (player_name);

alter table ranking enable row level security;

-- Anyone can read the leaderboard; anyone can submit a score.
-- Tighten this (e.g. require auth) before launch if abuse becomes a concern.
create policy "ranking_select_all" on ranking for select using (true);
create policy "ranking_insert_all" on ranking for insert with check (true);
