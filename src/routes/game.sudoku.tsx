import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import SudokuStandalone from '@/pages/SudokuStandalone';

function SudokuPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal top bar */}
      <div className="flex items-center px-4 h-12 border-b border-border bg-card/50 backdrop-blur-sm z-10">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline"
        >
          <ArrowLeft className="h-4 w-4" />
          工具箱
        </Link>
        <div className="flex-1 text-center">
          <span className="text-base font-medium text-foreground">数独</span>
        </div>
        <div className="w-16" />
      </div>

      {/* Full sudoku experience */}
      <div className="flex-1 flex flex-col">
        <SudokuStandalone />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/game/sudoku')({
  component: SudokuPage,
});
