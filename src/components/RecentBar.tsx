import { useNavigate } from 'react-router-dom';
import type { ToolMeta } from '../types';
import { useTheme } from '../theme';

interface RecentBarProps {
  tools: ToolMeta[];
}

export default function RecentBar({ tools }: RecentBarProps) {
  const navigate = useNavigate();
  const t = useTheme();

  if (tools.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ color: t.textSecondary, fontSize: 13, marginBottom: 10 }}>
        最近使用
      </div>
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none' as any,
        }}
      >
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => navigate(`/tool/${tool.id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: t.card,
              border: `0.5px solid ${t.border}`,
              borderRadius: 20,
              padding: '6px 14px',
              color: t.text,
              cursor: 'pointer',
              fontSize: 13,
              whiteSpace: 'nowrap',
              fontFamily: "'Noto Sans SC', sans-serif",
              flexShrink: 0,
              transition: 'border-color 200ms',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                t.borderHover;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                t.border;
            }}
          >
            <span>{tool.icon}</span>
            <span>{tool.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
