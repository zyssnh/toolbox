import { createFileRoute } from '@tanstack/react-router';
import SudokuStandalone from '@/pages/SudokuStandalone';

function SudokuPage() {
  return <SudokuStandalone />;
}

export const Route = createFileRoute('/game/sudoku')({
  component: SudokuPage,
});
