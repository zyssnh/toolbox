import type { SudokuTheme } from './index';

export const glassmorphismTheme: SudokuTheme = {
  id: 'glassmorphism',
  name: '玻璃态',
  icon: '🌌',
  fonts: {
    ui: "'Noto Sans SC', sans-serif",
    board: "'Noto Sans SC', sans-serif",
  },
  colors: {
    // Dynamic mesh: layered radial gradients with subtle animation
    pageBg: '#0a0a1a',
    pageBgMesh: `
      radial-gradient(ellipse at 20% 50%, rgba(120, 50, 255, 0.25) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(30, 100, 255, 0.2) 0%, transparent 50%),
      radial-gradient(ellipse at 60% 80%, rgba(0, 200, 255, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 40% 40%, rgba(180, 100, 255, 0.1) 0%, transparent 40%),
      linear-gradient(135deg, #0a0a2e 0%, #0d1025 30%, #0a1a2e 70%, #0a0a1a 100%)
    `,
    panelBg: 'rgba(255, 255, 255, 0.06)',
    boardBg: 'rgba(255, 255, 255, 0.04)',
    boardBorder: 'rgba(255, 255, 255, 0.15)',
    boxBorder: 'rgba(255, 255, 255, 0.25)',
    cellBorder: 'rgba(255, 255, 255, 0.08)',
    cellBg: 'rgba(255, 255, 255, 0.02)',
    cellSelectedBg: 'rgba(100, 150, 255, 0.25)',
    cellHighlightBg: 'rgba(100, 150, 255, 0.1)',
    cellSameNumBg: 'rgba(100, 180, 255, 0.15)',
    givenNumColor: '#ffffff',
    userNumColor: '#8ee4ff',
    pencilMarkColor: 'rgba(180, 210, 255, 0.5)',
    errorColor: '#ff6b7a',
    buttonBg: 'rgba(255, 255, 255, 0.08)',
    buttonText: '#e0e0f0',
    buttonHoverBg: 'rgba(255, 255, 255, 0.14)',
    accentColor: '#7b9fff',
    accentHover: '#9db8ff',
    textColor: '#e8e8f8',
    textSecondary: 'rgba(220, 220, 240, 0.55)',
    overlayBg: 'rgba(8, 8, 24, 0.85)',
    dividerColor: 'rgba(255, 255, 255, 0.08)',
  },
  effects: {
    boardBlur: '16px',
    boardBackdrop: 'blur(16px) saturate(120%)',
    panelShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
    cellBorderRadius: '2px',
  },
};
