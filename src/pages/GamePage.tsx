import { useParams, Link } from 'react-router-dom';
import { Suspense } from 'react';
import { toolMetas, toolComponents } from '../registry';
import { useTheme } from '../theme';

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const t = useTheme();

  // Map route gameId to tool id (e.g., "snake" -> "game-snake")
  const toolId = gameId ? `game-${gameId}` : '';
  const meta = toolMetas.find((m) => m.id === toolId);
  const Component = toolComponents[toolId];

  if (!meta || !Component) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: t.bg,
          color: t.text,
          fontFamily: "'Noto Sans SC', sans-serif",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎮</div>
        <div style={{ fontSize: 18, marginBottom: 8 }}>游戏未找到</div>
        <div style={{ color: t.textSecondary, fontSize: 14, marginBottom: 24 }}>
          该游戏可能已被移除或链接无效
        </div>
        <Link
          to="/"
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
    <div
      style={{
        minHeight: '100vh',
        background: t.bg,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Noto Sans SC', sans-serif",
      }}
    >
      {/* Top bar with back link */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: `0.5px solid ${t.border}`,
          background: t.card,
        }}
      >
        <Link
          to="/"
          style={{
            color: t.textSecondary,
            fontSize: 14,
            textDecoration: 'none',
            padding: '6px 12px',
            background: t.hover,
            borderRadius: 6,
            transition: 'background 0.2s',
          }}
        >
          ← 返回工具箱
        </Link>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: 24, marginRight: 8 }}>{meta.icon}</span>
          <span style={{ fontSize: 18, fontWeight: 600, color: t.text }}>
            {meta.name}
          </span>
        </div>
        {/* Spacer to balance back button */}
        <div style={{ width: 80 }} />
      </div>

      {/* Game content — full screen */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Suspense
          fallback={
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: t.textSecondary,
              }}
            >
              加载中...
            </div>
          }
        >
          <Component />
        </Suspense>
      </div>
    </div>
  );
}
