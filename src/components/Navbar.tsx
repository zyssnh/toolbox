import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useSearch } from './Layout';
import { useAppStore } from '../store/useAppStore';

export default function Navbar() {
  const { searchQuery, setSearchQuery } = useSearch();
  const favoritesCount = useAppStore((s) => s.favorites.length);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        background: '#141418',
        borderBottom: '0.5px solid #2a2a30',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 100,
        gap: 16,
      }}
    >
      <Link
        to="/#/"
        style={{
          textDecoration: 'none',
          color: '#E0E0E8',
          fontWeight: 600,
          fontSize: 18,
          fontFamily: "'JetBrains Mono', monospace",
          flexShrink: 0,
        }}
      >
        ⚡ ToolKit
      </Link>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <Link
        to="/#/favorites"
        style={{
          textDecoration: 'none',
          color: '#888890',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}
      >
        ❤️ 收藏
        {favoritesCount > 0 && (
          <span
            style={{
              background: '#4F8EF7',
              color: '#fff',
              borderRadius: 20,
              padding: '2px 8px',
              fontSize: 12,
              fontWeight: 600,
              minWidth: 20,
              textAlign: 'center',
            }}
          >
            {favoritesCount}
          </span>
        )}
      </Link>
    </nav>
  );
}
