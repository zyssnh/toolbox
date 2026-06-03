import { useAppStore, type ThemeMode } from './store/useAppStore';

export interface ThemeColors {
  bg: string;
  card: string;
  hover: string;
  primary: string;
  primaryHover: string;
  green: string;
  purple: string;
  yellow: string;
  pink: string;
  text: string;
  textSecondary: string;
  textHint: string;
  border: string;
  borderHover: string;
  inputBg: string;
}

const dark: ThemeColors = {
  bg: '#0F0F11',
  card: '#141418',
  hover: '#1A1A1F',
  primary: '#4F8EF7',
  primaryHover: '#7aabff',
  green: '#39D98A',
  purple: '#a78bfa',
  yellow: '#f59e0b',
  pink: '#ec4899',
  text: '#E0E0E8',
  textSecondary: '#888890',
  textHint: '#55555F',
  border: '#2a2a30',
  borderHover: '#3a3a48',
  inputBg: '#0F0F11',
};

const light: ThemeColors = {
  bg: '#F5F5F8',
  card: '#FFFFFF',
  hover: '#F0F0F3',
  primary: '#3B7DE6',
  primaryHover: '#5A94F0',
  green: '#2EB87A',
  purple: '#7C3AED',
  yellow: '#D97706',
  pink: '#DB2777',
  text: '#1A1A24',
  textSecondary: '#6B6B76',
  textHint: '#9A9AA4',
  border: '#E0E0E4',
  borderHover: '#C4C4CC',
  inputBg: '#F5F5F8',
};

export const themeMap: Record<ThemeMode, ThemeColors> = { dark, light };

export function useTheme(): ThemeColors {
  const theme = useAppStore((s) => s.theme);
  return themeMap[theme];
}

export function applyThemeToDocument(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode);
}
