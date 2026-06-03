import type { ToolMeta } from '../types';
import { useAppStore } from '../store/useAppStore';

interface ToolCardProps {
  meta: ToolMeta;
  onClick: () => void;
}

export default function ToolCard({ meta, onClick }: ToolCardProps) {
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFavorited = favorites.includes(meta.id);

  return (
    <div
      onClick={onClick}
      style={{
        background: '#141418',
        border: '0.5px solid #2a2a30',
        borderRadius: 8,
        padding: 20,
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 200ms, border-color 200ms',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(-2px)';
        el.style.borderColor = '#3a3a48';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(0)';
        el.style.borderColor = '#2a2a30';
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
          color: isFavorited ? '#f59e0b' : '#55555F',
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
          color: '#E0E0E8',
          marginBottom: 6,
        }}
      >
        {meta.name}
      </div>

      {/* Description */}
      <div
        style={{
          color: '#888890',
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
              color: '#39D98A',
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
              color: '#4F8EF7',
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
              color: '#55555F',
              fontSize: 12,
              background: '#0F0F11',
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
