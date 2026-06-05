import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'dark' | 'light';

interface AppStore {
  favorites: string[];
  recentTools: string[];
  theme: ThemeMode;
  sudokuTheme: string;
  toggleFavorite: (id: string) => void;
  addRecent: (id: string) => void;
  toggleTheme: () => void;
  setSudokuTheme: (id: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      recentTools: [],
      theme: 'dark',
      sudokuTheme: 'glassmorphism',
      toggleFavorite: (id) => {
        const favs = get().favorites;
        set({ favorites: favs.includes(id) ? favs.filter(f => f !== id) : [id, ...favs] });
      },
      addRecent: (id) => {
        const recent = get().recentTools.filter(r => r !== id);
        set({ recentTools: [id, ...recent].slice(0, 8) });
      },
      toggleTheme: () => {
        set({ theme: get().theme === 'dark' ? 'light' : 'dark' });
      },
      setSudokuTheme: (id) => {
        set({ sudokuTheme: id });
      },
    }),
    { name: 'toolbox-store' }
  )
);
