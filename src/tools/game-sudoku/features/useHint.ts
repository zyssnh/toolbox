import { useState, useCallback } from 'react';
import type { Board } from '../types';
import { findHintFromSolution } from '../logic';

export function useHint() {
  const [hintCount, setHintCount] = useState(0);
  const [hintCell, setHintCell] = useState<{
    r: number;
    c: number;
    value: number;
  } | null>(null);

  const requestHint = useCallback(
    (puzzle: Board, solution: Board): { r: number; c: number; value: number } | null => {
      const hint = findHintFromSolution(puzzle, solution);
      if (hint) {
        setHintCount((prev) => prev + 1);
        setHintCell(hint);
        // Clear hint highlight after 2 seconds
        setTimeout(() => setHintCell(null), 2000);
      }
      return hint;
    },
    [],
  );

  const resetHints = useCallback(() => {
    setHintCount(0);
    setHintCell(null);
  }, []);

  return {
    hintCount,
    hintCell,
    requestHint,
    resetHints,
  };
}
