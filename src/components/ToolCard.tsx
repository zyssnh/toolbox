import type { ToolMeta } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme';

interface ToolCardProps {
  meta: ToolMeta;
  onClick: () => void;
}

export default function ToolCard({ meta, onClick }: ToolCardProps) {
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFavorited = favorites.includes(meta.id);
  const t = useTheme();

  return (
    <div
      onClick={onClick}
      style={{
        background: t.card,
        border: `0.5px solid ${t.border}`,
        borderRadius: 8,
        padding: 20,
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 200ms, border-color 200ms',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(-2px)';
        el.style.borderColor = t.borderHover;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(0)';
        el.style.borderColor = t.border;
      }}
    >
      {/* Favorite star button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(meta.id);
        }}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: 18,
          padding: 0,
          lineHeight: 1,
          color: isFavorited ? '#f59e0b' : t.textSecondary,
          transition: 'color 200ms',
        }}
        title={isFavorited ? '取消收藏' : '收藏'}
      >
        {isFavorited ? '⭐' : '☆'}
      </button>

      {/* Icon */}
      <div style={{ fontSize: 32, marginBottom: 12 }}>{meta.icon}</div>

      {/* Name */}
      <div
        style={{
          fontWeight: 500,
          fontSize: 16,
          color: t.text,
          marginBottom: 6,
        }}
      >
        {meta.name}
      </div>

      {/* Description */}
      <div
        style={{
          color: t.textSecondary,
          fontSize: 13,
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        {meta.description}
      </div>

      {/* Badges + Tags */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {meta.isNew && (
          <span
            style={{
              background: '#39D98A33',
              color: t.green,
              borderRadius: 6,
              padding: '2px 8px',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            NEW
          </span>
        )}
        {meta.isHot && (
          <span
            style={{
              background: '#4F8EF733',
              color: t.primary,
              borderRadius: 6,
              padding: '2px 8px',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            HOT
          </span>
        )}
        {meta.tags.map((tag) => (
          <span
            key={tag}
            style={{
              color: t.textSecondary,
              fontSize: 12,
              background: t.hover,
              borderRadius: 6,
              padding: '2px 6px',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
