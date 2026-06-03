import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toolMetas } from '../registry';
import { useAppStore } from '../store/useAppStore';
import ToolGrid from '../components/ToolGrid';

export default function Favorites() {
  const favorites = useAppStore((s) => s.favorites);

  const favoritedTools = useMemo(() => {
    const favSet = new Set(favorites);
    return toolMetas.filter((t) => favSet.has(t.id));
  }, [favorites]);

  return (
    <div>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: '#E0E0E8',
          marginBottom: 24,
        }}
      >
        ❤️ 收藏的工具
      </h1>

      {favoritedTools.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <div style={{ color: '#E0E0E8', fontSize: 16, marginBottom: 8 }}>
            还没有收藏任何工具
          </div>
          <div style={{ color: '#888890', fontSize: 14, marginBottom: 24 }}>
            去首页看看吧～
          </div>
          <Link
            to="/#/"
            style={{
              display: 'inline-block',
              color: '#fff',
              background: '#4F8EF7',
              borderRadius: 20,
              padding: '8px 24px',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            前往首页
          </Link>
        </div>
      ) : (
        <ToolGrid tools={favoritedTools} />
      )}
    </div>
  );
}
