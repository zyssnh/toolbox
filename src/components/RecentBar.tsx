import { useNavigate } from 'react-router-dom';
import type { ToolMeta } from '../types';

interface RecentBarProps {
  tools: ToolMeta[];
}

export default function RecentBar({ tools }: RecentBarProps) {
  const navigate = useNavigate();

  if (tools.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ color: '#888890', fontSize: 13, marginBottom: 10 }}>
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
              background: '#141418',
              border: '0.5px solid #2a2a30',
              borderRadius: 20,
              padding: '6px 14px',
              color: '#E0E0E8',
              cursor: 'pointer',
              fontSize: 13,
              whiteSpace: 'nowrap',
              fontFamily: "'Noto Sans SC', sans-serif",
              flexShrink: 0,
              transition: 'border-color 200ms',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                '#3a3a48';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                '#2a2a30';
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
