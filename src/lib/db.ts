/**
 * db.ts — Supabase sync helpers
 *
 * Table schema (run setup.sql once in your Supabase SQL editor):
 *
 *   create table progress (
 *     passcode        text primary key,
 *     xp              integer not null default 0,
 *     level           integer not null default 1,
 *     streak          integer not null default 0,
 *     last_played     text,
 *     words_learned_today integer not null default 0,
 *     last_activity_date  text,
 *     daily_log       jsonb not null default '[]',
 *     unknown_word_ids integer[] not null default '{}',
 *     updated_at      timestamptz not null default now()
 *   );
 */

import { supabase } from './supabase';
import type { DailyLog } from '../store';

export interface DbProgress {
  xp: number;
  level: number;
  streak: number;
  lastPlayed: string | null;
  wordsLearnedToday: number;
  lastActivityDate: string | null;
  dailyLog: DailyLog[];
  unknownWordIds: number[];
}

type DbRow = {
  passcode: string;
  xp: number;
  level: number;
  streak: number;
  last_played: string | null;
  words_learned_today: number;
  last_activity_date: string | null;
  daily_log: DailyLog[];
  unknown_word_ids: number[];
};

function rowToProgress(row: DbRow): DbProgress {
  return {
    xp: row.xp,
    level: row.level,
    streak: row.streak,
    lastPlayed: row.last_played,
    wordsLearnedToday: row.words_learned_today,
    lastActivityDate: row.last_activity_date,
    dailyLog: row.daily_log ?? [],
    unknownWordIds: row.unknown_word_ids ?? [],
  };
}

/** Fetch progress for a passcode. Returns null if not found or supabase unavailable. */
export async function fetchProgress(passcode: string): Promise<DbProgress | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('passcode', passcode)
    .maybeSingle();
  if (error) { console.error('[db] fetchProgress error', error); return null; }
  if (!data) return null;
  return rowToProgress(data as DbRow);
}

/** Upsert progress for a passcode. */
export async function saveProgress(passcode: string, progress: DbProgress): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('progress').upsert({
    passcode,
    xp: progress.xp,
    level: progress.level,
    streak: progress.streak,
    last_played: progress.lastPlayed,
    words_learned_today: progress.wordsLearnedToday,
    last_activity_date: progress.lastActivityDate,
    daily_log: progress.dailyLog,
    unknown_word_ids: progress.unknownWordIds,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'passcode' });
  if (error) { console.error('[db] saveProgress error', error); return false; }
  return true;
}
