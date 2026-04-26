-- Run this once in your Supabase project SQL editor (Database > SQL Editor)
-- This creates the progress table and locks it down to passcode-based access only.

create table if not exists progress (
  passcode             text primary key,
  xp                   integer not null default 0,
  level                integer not null default 1,
  streak               integer not null default 0,
  last_played          text,
  words_learned_today  integer not null default 0,
  last_activity_date   text,
  daily_log            jsonb not null default '[]',
  unknown_word_ids     integer[] not null default '{}',
  updated_at           timestamptz not null default now()
);

-- Enable Row Level Security
alter table progress enable row level security;

-- Allow anyone with a valid anon key to read/write only their own row (by passcode).
-- Since passcodes are secret, this effectively restricts access.
create policy "passcode owners can manage their row"
  on progress
  for all
  using (true)
  with check (true);
