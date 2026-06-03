import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  favorites: string[];
  recentTools: string[];
  toggleFavorite: (id: string) => void;
  addRecent: (id: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      recentTools: [],
      toggleFavorite: (id) => {
        const favs = get().favorites;
        set({ favorites: favs.includes(id) ? favs.filter(f => f !== id) : [id, ...favs] });
      },
      addRecent: (id) => {
        const recent = get().recentTools.filter(r => r !== id);
        set({ recentTools: [id, ...recent].slice(0, 8) });
      },
    }),
    { name: 'toolbox-store' }
  )
);
