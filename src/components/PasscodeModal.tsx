import { useState } from "react";
import {
  KeyRound,
  Loader2,
  X,
  LogOut,
  Database,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAppStore } from "../store";
import { fetchProgress, saveProgress } from "../lib/db";
import { supabase } from "../lib/supabase";

const VALID_PASSCODES = ["2076", "7777", "0413"];

interface PasscodeModalProps {
  onClose: () => void;
}

export function PasscodeModal({ onClose }: PasscodeModalProps) {
  const {
    isLoggedIn,
    passcode,
    setLoggedIn,
    logout,
    hydrateFromDb,
    xp,
    level,
    streak,
    lastPlayed,
    wordsLearnedToday,
    lastActivityDate,
    dailyLog,
    unknownWordIds,
  } = useAppStore();
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!VALID_PASSCODES.includes(input.trim())) {
      setStatus("error");
      setMessage("Invalid passcode.");
      return;
    }
    setStatus("loading");
    const code = input.trim();

    // Fetch existing progress from Supabase
    const remote = await fetchProgress(code);
    if (remote) {
      hydrateFromDb(remote);
      setMessage("Progress loaded from database.");
    } else {
      // First login — push local progress to Supabase
      await saveProgress(code, {
        xp,
        level,
        streak,
        lastPlayed,
        wordsLearnedToday,
        lastActivityDate,
        dailyLog,
        unknownWordIds,
      });
      setMessage("Logged in. Local progress saved to database.");
    }
    setLoggedIn(code);
    setStatus("success");
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleSync = async () => {
    if (!passcode) return;
    setStatus("loading");
    setMessage("");
    const ok = await saveProgress(passcode, {
      xp,
      level,
      streak,
      lastPlayed,
      wordsLearnedToday,
      lastActivityDate,
      dailyLog,
      unknownWordIds,
    });
    setStatus(ok ? "success" : "error");
    setMessage(
      ok
        ? "Progress synced to database."
        : "Sync failed. Check your connection.",
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#1E232B] border border-slate-700 rounded-3xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-indigo-400" />
            <span className="font-semibold text-white">Database Sync</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {isLoggedIn ? (
          /* ── Logged-in state ── */
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3 text-sm font-medium">
              <CheckCircle2 size={16} />
              Logged in with passcode ••••
            </div>
            {!supabase && (
              <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 text-sm">
                <AlertCircle size={16} />
                Supabase not configured. Add env vars to enable sync.
              </div>
            )}
            <button
              onClick={handleSync}
              disabled={status === "loading" || !supabase}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all"
            >
              {status === "loading" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Database size={18} />
              )}
              Sync Progress Now
            </button>
            {message && (
              <p
                className={`text-sm text-center ${status === "success" ? "text-emerald-400" : "text-red-400"}`}
              >
                {message}
              </p>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white font-medium transition-all"
            >
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        ) : (
          /* ── Login state ── */
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Enter your passcode to sync progress across devices via Supabase.
            </p>
            <div className="relative">
              <KeyRound
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="Passcode"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setStatus("idle");
                  setMessage("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#16191F] border border-slate-700 focus:border-indigo-500 outline-none text-white placeholder-slate-600 text-sm tracking-widest transition-colors"
              />
            </div>
            {status === "error" && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle size={14} /> {message}
              </p>
            )}
            {status === "success" && (
              <p className="text-sm text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={14} /> {message}
              </p>
            )}
            <button
              onClick={handleLogin}
              disabled={status === "loading" || !input.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all"
            >
              {status === "loading" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <KeyRound size={18} />
              )}
              Log In & Sync
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
