/**
 * db.ts — Supabase auth + sync helpers
 *
 * Auth: Email OTP (one-time code sent to user's email).
 * No passwords — users enter their email, get a 6-digit code, enter it.
 *
 * Supabase setup required:
 *   Auth → Providers → Email → Enabled
 *   (No other special config needed — OTP is on by default with email provider)
 */

import { supabase } from "./supabase";
import type { DailyLog } from "../store";

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

/** Send a 6-digit OTP code to the user's email. Returns true on success. */
export async function sendLoginOtp(email: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) {
    console.error("[db] sendLoginOtp error", error);
    return false;
  }
  return true;
}

/** Verify the OTP code from the user's email. Returns { userId, email, name } on success. */
export async function verifyLoginOtp(
  email: string,
  token: string,
): Promise<{ userId: string; email: string; name: string | null } | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error || !data.user) {
    console.error("[db] verifyLoginOtp error", error);
    return null;
  }
  const name =
    (data.user.user_metadata?.full_name as string | undefined) ?? null;
  return { userId: data.user.id, email: data.user.email!, name };
}

/** Update the display name stored in Supabase user metadata. */
export async function updateUserName(name: string): Promise<void> {
  if (!supabase) return;
  await supabase.auth.updateUser({ data: { full_name: name } });
}

/** Sign out the current user from Supabase. */
export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/** Check for an existing Supabase session. Returns { userId, email, name } or null. */
export async function getActiveSession(): Promise<{
  userId: string;
  email: string;
  name: string | null;
} | null> {
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;
  const name =
    (session.user.user_metadata?.full_name as string | undefined) ?? null;
  return { userId: session.user.id, email: session.user.email!, name };
}

/** Fetch progress for a user. Returns null if not found or Supabase unavailable. */
export async function fetchProgress(
  userId: string,
): Promise<DbProgress | null> {
  if (!supabase) return null;

  const [{ data: prog, error }, { data: unk }] = await Promise.all([
    supabase.from("progress").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("unknown_words").select("word_id").eq("user_id", userId),
  ]);

  if (error) {
    console.error("[db] fetchProgress error", error);
    return null;
  }

  const unknownWordIds = (unk ?? []).map((r: { word_id: number }) => r.word_id);

  if (!prog) {
    // New user — no remote data yet
    return {
      xp: 0,
      level: 1,
      streak: 0,
      lastPlayed: null,
      wordsLearnedToday: 0,
      lastActivityDate: null,
      dailyLog: [],
      unknownWordIds,
    };
  }

  return {
    xp: prog.xp,
    level: prog.level,
    streak: prog.streak,
    lastPlayed: prog.last_played,
    wordsLearnedToday: prog.words_learned_today,
    lastActivityDate: prog.last_activity_date,
    dailyLog: prog.daily_log ?? [],
    unknownWordIds,
  };
}

/** Save progress for a user (upsert). Returns true on success. */
export async function saveProgress(
  userId: string,
  progress: DbProgress,
): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from("progress").upsert(
    {
      user_id: userId,
      xp: progress.xp,
      level: progress.level,
      streak: progress.streak,
      last_played: progress.lastPlayed,
      words_learned_today: progress.wordsLearnedToday,
      last_activity_date: progress.lastActivityDate,
      daily_log: progress.dailyLog,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("[db] saveProgress error", error);
    return false;
  }

  // Replace unknown words
  await supabase.from("unknown_words").delete().eq("user_id", userId);
  if (progress.unknownWordIds.length > 0) {
    await supabase
      .from("unknown_words")
      .insert(
        progress.unknownWordIds.map((id) => ({ user_id: userId, word_id: id })),
      );
  }

  return true;
}
