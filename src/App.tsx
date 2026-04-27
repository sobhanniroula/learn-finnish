import { useState, useEffect, useRef } from "react";
import {
  Home,
  BookOpen,
  BrainCircuit,
  Mic,
  Moon,
  Sun,
  User,
  LogIn,
} from "lucide-react";
import { useAppStore } from "./store";
import { getActiveSession, fetchProgress, saveProgress } from "./lib/db";
import { Dashboard } from "./components/Dashboard";
import { Vocabulary } from "./components/Vocabulary";
import { Exercises } from "./components/Exercises";
import { Pronunciation } from "./components/Pronunciation";
import { PasscodeModal } from "./components/PasscodeModal";

const navItems = [
  { id: "home", label: "Dashboard", icon: Home },
  { id: "vocabulary", label: "Vocabulary", icon: BookOpen },
  { id: "exercises", label: "Exercises", icon: BrainCircuit },
  { id: "pronunciation", label: "Pronounce", icon: Mic },
] as const;

type TabId = (typeof navItems)[number]["id"];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [showPasscode, setShowPasscode] = useState(false);
  const {
    theme,
    toggleTheme,
    playToday,
    isLoggedIn,
    userName,
    sessionExpiresAt,
    setLoggedIn,
    hydrateFromDb,
    clearSession,
    xp,
    level,
    streak,
    lastPlayed,
    wordsLearnedToday,
    lastActivityDate,
    dailyLog,
    unknownWordIds,
  } = useAppStore();

  // Skip the very first render so hydration/session-restore doesn't
  // immediately fire a write back to the DB with stale local data.
  const isFirstSync = useRef(true);

  // Auto-sync to DB 2 s after the last progress change.
  // localStorage is written synchronously by Zustand's persist middleware
  // on every change, so it always acts as the immediate local copy.
  useEffect(() => {
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const s = useAppStore.getState();
      if (!s.isLoggedIn || !s.userId) return;
      saveProgress(s.userId, {
        xp: s.xp,
        level: s.level,
        streak: s.streak,
        lastPlayed: s.lastPlayed,
        wordsLearnedToday: s.wordsLearnedToday,
        lastActivityDate: s.lastActivityDate,
        dailyLog: s.dailyLog,
        unknownWordIds: s.unknownWordIds,
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [
    xp,
    level,
    streak,
    lastPlayed,
    wordsLearnedToday,
    lastActivityDate,
    dailyLog,
    unknownWordIds,
  ]);

  useEffect(() => {
    playToday();
    document.documentElement.classList.toggle("dark", theme === "dark");

    // Restore session if within 7-day window
    if (sessionExpiresAt && sessionExpiresAt > Date.now()) {
      getActiveSession().then((result) => {
        if (result) {
          fetchProgress(result.userId).then((data) => {
            if (data) hydrateFromDb(data);
            setLoggedIn(result.userId, result.email, result.name);
          });
        } else {
          clearSession();
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-(--bg-app) text-slate-200 font-sans">
      {/* ── DESKTOP SIDEBAR ─────────────────────────────── */}
      <nav className="hidden md:flex w-64 flex-col bg-(--bg-nav) border-r border-slate-800 sticky top-0 h-screen shrink-0">
        <div className="p-8 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 11" className="w-full h-full">
              <rect width="18" height="11" fill="#fff"/>
              <rect x="4" y="0" width="3" height="11" fill="#003580"/>
              <rect x="0" y="4" width="18" height="3" fill="#003580"/>
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            Learn Finnish
          </span>
        </div>

        <div className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span className={isActive ? "font-medium" : ""}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-8 space-y-3">
          <button
            onClick={() => setShowPasscode(true)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-medium ${isLoggedIn ? "bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
          >
            <span>{isLoggedIn ? (userName ?? "Learner") : "Login"}</span>
            {isLoggedIn ? <User size={18} /> : <LogIn size={18} />}
          </button>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 font-medium"
          >
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      {/* ── MOBILE TOP BAR ──────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-(--bg-nav) border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg overflow-hidden shadow-lg shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 11" className="w-full h-full">
              <rect width="18" height="11" fill="#fff"/>
              <rect x="4" y="0" width="3" height="11" fill="#003580"/>
              <rect x="0" y="4" width="18" height="3" fill="#003580"/>
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Learn Finnish
          </span>
        </div>
        <button
          onClick={() => setShowPasscode(true)}
          className={`p-2 transition-colors ${isLoggedIn ? "text-indigo-400" : "text-slate-400 hover:text-white active:text-white"}`}
        >
          {isLoggedIn ? <User size={22} /> : <LogIn size={22} />}
        </button>
        <button
          onClick={toggleTheme}
          className="text-slate-400 hover:text-white active:text-white transition-colors p-2"
        >
          {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────── */}
      <main className="flex-1 md:h-screen md:overflow-y-auto px-4 md:px-10 py-6 pb-24 md:pb-8 scroll-smooth">
        <div className="w-full max-w-5xl mx-auto">
          {activeTab === "home" && (
            <Dashboard onNavigate={(tab) => setActiveTab(tab as TabId)} />
          )}
          {activeTab === "vocabulary" && <Vocabulary />}
          {activeTab === "exercises" && <Exercises />}
          {activeTab === "pronunciation" && <Pronunciation />}
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-(--bg-nav) border-t border-slate-800">
        <div className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-slate-500 active:text-slate-300"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span
                  className={`text-[10px] font-semibold ${isActive ? "text-white" : ""}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── PASSCODE MODAL ──────────────────────────────── */}
      {showPasscode && <PasscodeModal onClose={() => setShowPasscode(false)} />}
    </div>
  );
}
