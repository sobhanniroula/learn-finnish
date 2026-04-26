import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DailyLog {
  date: string; // "YYYY-MM-DD"
  count: number; // words learned that day
}

interface AppState {
  // ── progress ──────────────────────────────────────────
  xp: number;
  level: number;
  streak: number;
  lastPlayed: string | null; // date string for streak tracking
  wordsLearnedToday: number; // resets each new day
  lastActivityDate: string | null; // "YYYY-MM-DD"
  dailyLog: DailyLog[]; // history of words learned per day
  unknownWordIds: number[]; // vocab ids the user got wrong

  // ── ui ────────────────────────────────────────────────
  theme: "dark" | "light";

  // ── auth ──────────────────────────────────────────────
  isLoggedIn: boolean;
  passcode: string | null;

  // ── actions ───────────────────────────────────────────
  toggleTheme: () => void;
  addXp: (amount: number) => void;
  playToday: () => void;
  recordWordLearned: () => void;
  markUnknown: (id: number) => void;
  unmarkUnknown: (id: number) => void;
  setLoggedIn: (passcode: string) => void;
  logout: () => void;
  /** Bulk-load state from Supabase (replaces current progress) */
  hydrateFromDb: (data: {
    xp: number;
    level: number;
    streak: number;
    lastPlayed: string | null;
    wordsLearnedToday: number;
    lastActivityDate: string | null;
    dailyLog: DailyLog[];
    unknownWordIds: number[];
  }) => void;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      xp: 0,
      level: 1,
      streak: 0,
      lastPlayed: null,
      wordsLearnedToday: 0,
      lastActivityDate: null,
      dailyLog: [],
      unknownWordIds: [],
      theme: "dark",
      isLoggedIn: false,
      passcode: null,

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === "dark" ? "light" : "dark";
          document.documentElement.classList.toggle(
            "dark",
            newTheme === "dark",
          );
          return { theme: newTheme };
        }),

      addXp: (amount) =>
        set((state) => {
          const newXp = state.xp + amount;
          const newLevel = Math.floor(newXp / 100) + 1;
          return { xp: newXp, level: newLevel };
        }),

      playToday: () =>
        set((state) => {
          const today = new Date().toDateString();
          if (state.lastPlayed !== today) {
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterday = yesterdayDate.toDateString();
            return {
              streak: state.lastPlayed === yesterday ? state.streak + 1 : 1,
              lastPlayed: today,
            };
          }
          return state;
        }),

      recordWordLearned: () =>
        set((state) => {
          const today = todayISO();
          const isNewDay = state.lastActivityDate !== today;
          const newCount = isNewDay ? 1 : state.wordsLearnedToday + 1;
          const existingLog = state.dailyLog.filter((d) => d.date !== today);
          return {
            wordsLearnedToday: newCount,
            lastActivityDate: today,
            dailyLog: [...existingLog, { date: today, count: newCount }],
          };
        }),

      markUnknown: (id) =>
        set((state) => ({
          unknownWordIds: state.unknownWordIds.includes(id)
            ? state.unknownWordIds
            : [...state.unknownWordIds, id],
        })),

      unmarkUnknown: (id) =>
        set((state) => ({
          unknownWordIds: state.unknownWordIds.filter((x) => x !== id),
        })),

      setLoggedIn: (passcode) => set({ isLoggedIn: true, passcode }),

      logout: () => set({ isLoggedIn: false, passcode: null }),

      hydrateFromDb: (data) =>
        set({
          xp: data.xp,
          level: data.level,
          streak: data.streak,
          lastPlayed: data.lastPlayed,
          wordsLearnedToday: data.wordsLearnedToday,
          lastActivityDate: data.lastActivityDate,
          dailyLog: data.dailyLog,
          unknownWordIds: data.unknownWordIds,
        }),
    }),
    {
      name: "learn-finnish-progress",
      // only persist progress fields, not transient auth state
      partialize: (state) => ({
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        lastPlayed: state.lastPlayed,
        wordsLearnedToday: state.wordsLearnedToday,
        lastActivityDate: state.lastActivityDate,
        dailyLog: state.dailyLog,
        unknownWordIds: state.unknownWordIds,
        theme: state.theme,
      }),
    },
  ),
);
