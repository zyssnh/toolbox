import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useSearch } from './Layout';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme';

export default function Navbar() {
  const { searchQuery, setSearchQuery } = useSearch();
  const favoritesCount = useAppStore((s) => s.favorites.length);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const mode = useAppStore((s) => s.theme);
  const t = useTheme();

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        background: t.card,
        borderBottom: `0.5px solid ${t.border}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 100,
        gap: 16,
        backdropFilter: 'blur(12px)',
      }}
    >
      <Link
        to="/#/"
        style={{
          textDecoration: 'none',
          color: t.text,
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

      <button
        onClick={toggleTheme}
        className="theme-toggle-btn"
        style={{
          background: 'none',
          border: `0.5px solid ${t.border}`,
          borderRadius: 20,
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          color: t.text,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0,
        }}
        title={mode === 'dark' ? '切换到白天模式' : '切换到黑夜模式'}
      >
        {mode === 'dark' ? '☀️' : '🌙'}
      </button>

      <a
        href="/toolbox/docs/"
        style={{
          textDecoration: 'none',
          color: t.textSecondary,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        📖 文档
      </a>

      <Link
        to="/#/favorites"
        style={{
          textDecoration: 'none',
          color: t.textSecondary,
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
              background: t.primary,
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
