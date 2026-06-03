import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import Navbar from './Navbar';
import { useAppStore } from '../store/useAppStore';
import { applyThemeToDocument } from '../theme';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const SearchContext = createContext<SearchContextType>({
  searchQuery: '',
  setSearchQuery: () => {},
});

export const useSearch = () => useContext(SearchContext);

export default function Layout({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <div style={{ minHeight: '100vh', transition: 'background 0.3s ease' }}>
        <Navbar />
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24, paddingTop: 80 }}>
          {children}
        </main>
      </div>
    </SearchContext.Provider>
  );
}
