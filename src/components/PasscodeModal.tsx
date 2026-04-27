import { useState } from "react";
import {
  Mail,
  Loader2,
  X,
  LogOut,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Flame,
  BookOpen,
  AlertTriangle,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { useAppStore } from "../store";
import {
  sendLoginOtp,
  verifyLoginOtp,
  signOut,
  fetchProgress,
  saveProgress,
  updateUserName,
} from "../lib/db";
import { supabase } from "../lib/supabase";

interface PasscodeModalProps {
  onClose: () => void;
}

export function PasscodeModal({ onClose }: PasscodeModalProps) {
  const {
    isLoggedIn,
    userId,
    userEmail,
    userName,
    setLoggedIn,
    clearSession,
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

  // Login flow steps: "email" → "otp"
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [message, setMessage] = useState("");

  /* ── Step 1: send OTP ───────────────────────────────────── */
  const handleSendOtp = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    const ok = await sendLoginOtp(trimmed);
    if (!ok) {
      setStatus("error");
      setMessage("Failed to send code. Check your connection and try again.");
      return;
    }
    setStatus("idle");
    setStep("otp");
  };

  /* ── Step 2: verify OTP ─────────────────────────────────── */
  const handleVerifyOtp = async () => {
    const token = otp.trim();
    if (token.length < 6) {
      setStatus("error");
      setMessage("Please enter the full code from your email.");
      return;
    }
    setStatus("loading");
    const result = await verifyLoginOtp(email.trim().toLowerCase(), token);
    if (!result) {
      setStatus("error");
      setMessage("Invalid or expired code. Check your email and try again.");
      return;
    }

    // Save name to Supabase if it's a new user (no name yet) and one was entered
    const trimmedName = name.trim();
    let finalName = result.name;
    if (!finalName && trimmedName) {
      await updateUserName(trimmedName);
      finalName = trimmedName;
    }

    const remote = await fetchProgress(result.userId);
    if (remote && remote.xp > 0) {
      hydrateFromDb(remote);
    } else {
      await saveProgress(result.userId, {
        xp,
        level,
        streak,
        lastPlayed,
        wordsLearnedToday,
        lastActivityDate,
        dailyLog,
        unknownWordIds,
      });
    }
    setLoggedIn(result.userId, result.email, finalName);
    setStatus("success");
  };

  /* ── Sync handler ───────────────────────────────────────── */
  const handleSync = async () => {
    if (!userId) return;
    setStatus("loading");
    setMessage("");
    const ok = await saveProgress(userId, {
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
    setMessage(ok ? "Progress synced!" : "Sync failed. Check your connection.");
  };

  /* ── Logout handler ─────────────────────────────────────── */
  const handleLogout = async () => {
    if (userId) {
      await saveProgress(userId, {
        xp,
        level,
        streak,
        lastPlayed,
        wordsLearnedToday,
        lastActivityDate,
        dailyLog,
        unknownWordIds,
      });
    }
    await signOut();
    clearSession();
    onClose();
  };

  /* ── Activity chart ─────────────────────────────────────── */
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const label = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d.getDay()];
    const entry = dailyLog.find((l) => l.date === dateStr);
    return { date: dateStr, count: entry?.count ?? 0, label };
  });
  const maxDay = Math.max(...last7Days.map((d) => d.count), 1);

  /* ── XP bar ─────────────────────────────────────────────── */
  const xpInLevel = xp % 100;
  const xpToNext = 100 - xpInLevel;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-(--bg-card) border border-slate-700 rounded-3xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {!isLoggedIn && step === "otp" && (
              <button
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setName("");
                  setStatus("idle");
                  setMessage("");
                }}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <span className="font-bold text-lg text-white">
              {isLoggedIn
                ? "My Dashboard"
                : step === "email"
                  ? "Sign In"
                  : "Enter Code"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {isLoggedIn ? (
          /* ── Dashboard view ── */
          <div className="space-y-4">
            {/* Name / Email badge */}
            {(userName || userEmail) && (
              <div className="space-y-1.5 mb-1">
                {userName && (
                  <p className="text-base font-semibold text-white truncate">
                    {userName}
                  </p>
                )}
                {userEmail && (
                  <div className="flex items-center gap-2 text-slate-400 bg-slate-800/50 rounded-2xl px-3 py-2 text-xs">
                    <Mail size={12} className="text-indigo-400 shrink-0" />
                    <span className="truncate">{userEmail}</span>
                  </div>
                )}
              </div>
            )}

            {/* Level + XP bar */}
            <div className="bg-(--bg-nav) rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-indigo-400" />
                  <span className="text-sm font-bold text-white">
                    Level {level}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {xpInLevel}/100 XP · {xpToNext} to next
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${xpInLevel}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Total XP: {xp}</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-(--bg-nav) rounded-2xl p-3 text-center">
                <Flame size={16} className="text-orange-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{streak}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Streak</div>
              </div>
              <div className="bg-(--bg-nav) rounded-2xl p-3 text-center">
                <BookOpen size={16} className="text-emerald-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-white">
                  {wordsLearnedToday}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Today</div>
              </div>
              <div className="bg-(--bg-nav) rounded-2xl p-3 text-center">
                <AlertTriangle
                  size={16}
                  className="text-red-400 mx-auto mb-1"
                />
                <div className="text-xl font-bold text-white">
                  {unknownWordIds.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Review</div>
              </div>
            </div>

            {/* Last 7 days chart */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Last 7 Days
              </p>
              <div className="flex gap-1 items-end h-14">
                {last7Days.map((d) => (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-full rounded-sm transition-all ${d.count > 0 ? "bg-indigo-500/60" : "bg-slate-700/40"}`}
                      style={{
                        height: `${Math.max(4, (d.count / maxDay) * 44)}px`,
                      }}
                    />
                    <span className="text-[9px] text-slate-600 font-medium">
                      {d.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {message && (
              <p
                className={`text-xs text-center ${status === "success" ? "text-emerald-400" : "text-red-400"}`}
              >
                {message}
              </p>
            )}

            {!supabase && (
              <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-xs">
                <AlertCircle size={13} /> Supabase not configured — sync
                disabled.
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSync}
                disabled={status === "loading" || !supabase}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
              >
                {status === "loading" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <RefreshCw size={15} />
                )}
                Sync
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-sm transition-all"
              >
                <LogOut size={15} />
                Log Out
              </button>
            </div>
          </div>
        ) : step === "email" ? (
          /* ── Step 1: Email ── */
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Enter your email to receive a sign-in code. A new account is
              created automatically on first use.
            </p>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStatus("idle");
                  setMessage("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-(--bg-nav) border border-slate-700 focus:border-indigo-500 outline-none text-white placeholder-slate-500 text-sm transition-colors"
              />
            </div>
            {status === "error" && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle size={14} /> {message}
              </p>
            )}
            <button
              onClick={handleSendOtp}
              disabled={status === "loading" || !email.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all"
            >
              {status === "loading" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Mail size={18} />
              )}
              Send Code
            </button>
          </div>
        ) : (
          /* ── Step 2: OTP ── */
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              We sent a 6-digit code to{" "}
              <span className="text-white font-medium">{email}</span>. Enter it
              below.
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              placeholder="000000"
              value={otp}
              autoFocus
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                setStatus("idle");
                setMessage("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              className="w-full px-4 py-3 rounded-2xl bg-(--bg-nav) border border-slate-700 focus:border-indigo-500 outline-none text-white placeholder-slate-500 text-lg tracking-[0.5em] text-center transition-colors"
            />
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">
                Your name{" "}
                <span className="text-slate-600 normal-case">
                  (first-time only)
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. Matti"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                className="w-full px-4 py-2.5 rounded-2xl bg-(--bg-nav) border border-slate-700 focus:border-indigo-500 outline-none text-white placeholder-slate-500 text-sm transition-colors"
              />
            </div>
            {status === "error" && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle size={14} /> {message}
              </p>
            )}
            {status === "success" && (
              <p className="text-sm text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={14} /> Signed in!
              </p>
            )}
            <button
              onClick={handleVerifyOtp}
              disabled={status === "loading" || otp.length < 8}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all"
            >
              {status === "loading" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              Verify Code
            </button>
            <button
              onClick={() => {
                setStatus("loading");
                sendLoginOtp(email.trim().toLowerCase()).then(() =>
                  setStatus("idle"),
                );
              }}
              className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-1"
            >
              Didn't receive it? Resend code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
