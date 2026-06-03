import { useEffect, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toolMetas, toolComponents, categories } from '../registry';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme';

function SkeletonLoader() {
  const t = useTheme();

  return (
    <div style={{ background: t.card, borderRadius: 8, border: `0.5px solid ${t.border}`, overflow: 'hidden' }}>
      <div style={{ padding: 32 }}>
        <div
          style={{
            width: '40%',
            height: 20,
            background: t.hover,
            borderRadius: 6,
            animation: 'pulse 1.5s ease-in-out infinite',
            marginBottom: 16,
          }}
        />
        <div
          style={{
            width: '70%',
            height: 14,
            background: t.hover,
            borderRadius: 6,
            animation: 'pulse 1.5s ease-in-out infinite',
            marginBottom: 8,
          }}
        />
        <div
          style={{
            width: '60%',
            height: 14,
            background: t.hover,
            borderRadius: 6,
            animation: 'pulse 1.5s ease-in-out infinite 0.2s',
            marginBottom: 24,
          }}
        />
        <div
          style={{
            height: 200,
            background: t.hover,
            borderRadius: 6,
            animation: 'pulse 1.5s ease-in-out infinite 0.1s',
          }}
        />
      </div>
    </div>
  );
}

export default function ToolPage() {
  const { id } = useParams<{ id: string }>();
  const addRecent = useAppStore((s) => s.addRecent);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const t = useTheme();

  const meta = toolMetas.find((t) => t.id === id);
  const Component = id ? toolComponents[id] : undefined;
  const isFavorited = id ? favorites.includes(id) : false;
  const categoryInfo = meta
    ? categories.find((c) => c.id === meta.category)
    : undefined;

  useEffect(() => {
    if (id) {
      addRecent(id);
    }
  }, [id, addRecent]);

  if (!meta || !Component) {
    return (
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          background: t.card,
          borderRadius: 8,
          border: `0.5px solid ${t.border}`,
          padding: 60,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <div style={{ color: t.text, fontSize: 18, marginBottom: 8 }}>
          工具未找到
        </div>
        <div style={{ color: t.textSecondary, fontSize: 14, marginBottom: 24 }}>
          该工具可能已被移除或链接无效
        </div>
        <Link
          to="/#/"
          style={{
            color: t.primary,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          ← 返回首页
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Breadcrumb bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
          flexWrap: 'wrap' as any,
        }}
      >
        <Link
          to="/#/"
          style={{
            color: t.textSecondary,
            fontSize: 14,
            textDecoration: 'none',
            padding: '6px 12px',
            background: t.card,
            border: `0.5px solid ${t.border}`,
            borderRadius: 6,
            transition: 'border-color 200ms',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = t.borderHover;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = t.border;
          }}
        >
          ← 返回
        </Link>

        <span style={{ fontSize: 32, lineHeight: 1 }}>{meta.icon}</span>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: t.text,
            margin: 0,
          }}
        >
          {meta.name}
        </h1>

        {categoryInfo && (
          <span
            style={{
              background: t.hover,
              color: t.textSecondary,
              borderRadius: 6,
              padding: '4px 12px',
              fontSize: 13,
            }}
          >
            {categoryInfo.icon} {categoryInfo.label}
          </span>
        )}

        <button
          onClick={() => toggleFavorite(meta.id)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            padding: 0,
            lineHeight: 1,
            color: isFavorited ? '#f59e0b' : t.textSecondary,
            transition: 'color 200ms',
            marginLeft: 'auto',
          }}
          title={isFavorited ? '取消收藏' : '收藏'}
        >
          {isFavorited ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Tool content */}
      <div
        style={{
          background: t.card,
          borderRadius: 8,
          border: `0.5px solid ${t.border}`,
          overflow: 'hidden',
        }}
      >
        <Suspense fallback={<SkeletonLoader />}>
          <div style={{ padding: 32 }}>
            <Component />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
