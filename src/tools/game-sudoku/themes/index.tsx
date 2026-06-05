import { createContext, useContext, type ReactNode } from 'react';
import { glassmorphismTheme } from './glassmorphism';
import { zenTheme } from './zen';

/** Extensible theme configuration for Sudoku standalone page */
export interface SudokuTheme {
  id: string;
  name: string;
  icon: string;
  fonts: {
    ui: string;
    board: string;
  };
  colors: {
    pageBg: string;
    pageBgMesh?: string; // CSS for background mesh/gradient (applied as background)
    panelBg: string;
    boardBg: string;
    boardBorder: string;
    boxBorder: string;
    cellBorder: string;
    cellBg: string;
    cellSelectedBg: string;
    cellHighlightBg: string;
    cellSameNumBg: string;
    givenNumColor: string;
    userNumColor: string;
    pencilMarkColor: string;
    errorColor: string;
    buttonBg: string;
    buttonText: string;
    buttonHoverBg: string;
    accentColor: string;
    accentHover: string;
    textColor: string;
    textSecondary: string;
    overlayBg: string;
    dividerColor: string;
  };
  effects?: {
    boardBlur?: string;
    boardBackdrop?: string;
    panelShadow?: string;
    cellBorderRadius?: string;
  };
  /** Optional decorative SVG elements */
  decorations?: {
    cornerSealSvg?: string;
  };
}

const SudokuThemeContext = createContext<SudokuTheme | null>(null);

export function SudokuThemeProvider({
  theme,
  children,
}: {
  theme: SudokuTheme;
  children: ReactNode;
}) {
  return (
    <SudokuThemeContext.Provider value={theme}>
      {children}
    </SudokuThemeContext.Provider>
  );
}

export function useSudokuTheme(): SudokuTheme {
  const ctx = useContext(SudokuThemeContext);
  if (!ctx) throw new Error('useSudokuTheme must be used within SudokuThemeProvider');
  return ctx;
}

/** All available sudoku themes. Add new themes here to make them selectable. */
export const sudokuThemes: SudokuTheme[] = [glassmorphismTheme, zenTheme];

export function getSudokuTheme(id: string): SudokuTheme {
  return sudokuThemes.find((t) => t.id === id) || sudokuThemes[0];
}
