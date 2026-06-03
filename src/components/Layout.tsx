import { createContext, useContext, useState, type ReactNode } from 'react';
import Navbar from './Navbar';

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

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <div style={{ minHeight: '100vh', background: '#0F0F11' }}>
        <Navbar />
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24, paddingTop: 80 }}>
          {children}
        </main>
      </div>
    </SearchContext.Provider>
  );
}
