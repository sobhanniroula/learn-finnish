import { create } from 'zustand';

interface AppState {
  xp: number;
  level: number;
  streak: number;
  lastPlayed: string | null;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  addXp: (amount: number) => void;
  playToday: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  xp: 0,
  level: 1,
  streak: 0,
  lastPlayed: null,
  theme: 'dark',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    return { theme: newTheme };
  }),
  addXp: (amount) => set((state) => {
    const newXp = state.xp + amount;
    const newLevel = Math.floor(newXp / 100) + 1;
    return { xp: newXp, level: newLevel };
  }),
  playToday: () => set((state) => {
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
}));
