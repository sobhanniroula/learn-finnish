-- ============================================================
-- Learn Finnish — Supabase Database Setup
-- Run this in Supabase SQL Editor > New Query
--
-- Safe to re-run: drops existing tables and recreates them.
--
-- IMPORTANT: In Supabase Dashboard → Authentication → Providers
-- → Email → disable "Confirm email" so first-time auto-signup
-- works without email verification (passcodes use fake emails).
-- ============================================================

-- Drop old tables first (handles upgrade from passcode-based schema)
drop table if exists unknown_words cascade;
drop table if exists progress      cascade;

-- Users are managed by Supabase Auth (auth.users).
-- Passcodes become passwords; email = {passcode}@learn-finnish.app

-- 1. Progress table (one row per user)
create table progress (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  xp                  integer not null default 0,
  level               integer not null default 1,
  streak              integer not null default 0,
  last_played         text,
  words_learned_today integer not null default 0,
  last_activity_date  text,
  daily_log           jsonb not null default '[]',
  updated_at          timestamptz not null default now()
);

-- 2. Unknown words (separate table, many rows per user)
create table unknown_words (
  user_id uuid    not null references auth.users(id) on delete cascade,
  word_id integer not null,
  primary key (user_id, word_id)
);

-- 3. Row Level Security — each user can only see/edit their own rows
alter table progress      enable row level security;
alter table unknown_words enable row level security;

create policy "users manage own progress"
  on progress for all
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage own unknown words"
  on unknown_words for all
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);
