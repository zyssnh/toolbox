import type { SudokuTheme } from './index';

/** SVG seal stamp for the Zen theme — "数独" in seal script style */
const SEAL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
  <defs>
    <filter id="seal-rough">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
  <!-- Outer border — rough rectangle -->
  <rect x="3" y="3" width="74" height="74" rx="2" ry="2"
        fill="none" stroke="#c43a31" stroke-width="2.5" filter="url(#seal-rough)" opacity="0.85"/>
  <!-- Inner border -->
  <rect x="8" y="8" width="64" height="64" rx="1" ry="1"
        fill="none" stroke="#c43a31" stroke-width="1" opacity="0.55"/>
  <!-- Character: 数 (simplified seal look) -->
  <text x="40" y="36" text-anchor="middle" dominant-baseline="central"
        font-family="'Noto Serif SC', 'KaiTi', serif" font-size="24" font-weight="700"
        fill="#c43a31" opacity="0.85">数</text>
  <!-- Character: 独 -->
  <text x="40" y="62" text-anchor="middle" dominant-baseline="central"
        font-family="'Noto Serif SC', 'KaiTi', serif" font-size="20" font-weight="700"
        fill="#c43a31" opacity="0.85">独</text>
</svg>`;

export const zenTheme: SudokuTheme = {
  id: 'zen',
  name: '禅意',
  icon: '🏯',
  fonts: {
    ui: "'Noto Serif SC', 'KaiTi', serif",
    board: "'Noto Serif SC', 'KaiTi', serif",
  },
  colors: {
    // Rice paper background with ink wash feel
    pageBg: '#f7f3e9',
    pageBgMesh: `
      radial-gradient(ellipse at 30% 20%, rgba(180, 170, 150, 0.15) 0%, transparent 60%),
      radial-gradient(ellipse at 70% 60%, rgba(160, 140, 120, 0.1) 0%, transparent 50%),
      linear-gradient(to bottom, #f7f3e9 0%, #f2ede0 50%, #efe8d8 100%)
    `,
    panelBg: 'rgba(255, 252, 245, 0.7)',
    boardBg: 'rgba(255, 252, 245, 0.5)',
    boardBorder: '#8b7355',
    boxBorder: '#6b5b4a',
    cellBorder: '#c4b89e',
    cellBg: 'rgba(255, 252, 245, 0.3)',
    cellSelectedBg: 'rgba(90, 130, 160, 0.12)',
    cellHighlightBg: 'rgba(90, 130, 160, 0.06)',
    cellSameNumBg: 'rgba(90, 130, 160, 0.08)',
    givenNumColor: '#2c2416', // Ink black
    userNumColor: '#3a6070', // Stone blue
    pencilMarkColor: 'rgba(100, 120, 130, 0.4)',
    errorColor: '#c43a31', // Vermillion red
    buttonBg: '#e8e0d0',
    buttonText: '#3a3020',
    buttonHoverBg: '#ddd4c0',
    accentColor: '#8b6f4e',
    accentHover: '#a0845c',
    textColor: '#2c2416',
    textSecondary: '#8b7b65',
    overlayBg: 'rgba(240, 235, 225, 0.9)',
    dividerColor: '#d4c8b0',
  },
  effects: {
    boardBackdrop: 'none',
    panelShadow: '0 4px 16px rgba(80, 60, 30, 0.08), 0 1px 4px rgba(80, 60, 30, 0.04)',
    cellBorderRadius: '0px',
  },
  decorations: {
    cornerSealSvg: SEAL_SVG,
  },
};
