import { useState, useCallback } from 'react';
import type { Board, FixedBoard, PencilMarks } from '../types';
import { createEmptyPencilMarks, clonePencilMarks } from '../logic';

export function usePencilMarks(_board: Board, fixedCells: FixedBoard) {
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [pencilMarks, setPencilMarks] = useState<PencilMarks>(() =>
    createEmptyPencilMarks(),
  );

  const toggleNotesMode = useCallback(() => {
    setIsNotesMode((prev) => !prev);
  }, []);

  const toggleMark = useCallback(
    (r: number, c: number, num: number) => {
      if (fixedCells[r][c]) return;
      setPencilMarks((prev) => {
        const next = clonePencilMarks(prev);
        if (!next[r][c]) {
          next[r][c] = new Set<number>();
        }
        const cell = next[r][c]!;
        if (cell.has(num)) {
          cell.delete(num);
          if (cell.size === 0) next[r][c] = null;
        } else {
          cell.add(num);
        }
        return next;
      });
    },
    [fixedCells],
  );

  /** Clear pencil marks for a cell when a number is placed */
  const clearMarksForCell = useCallback((r: number, c: number) => {
    setPencilMarks((prev) => {
      const next = clonePencilMarks(prev);
      next[r][c] = null;
      return next;
    });
  }, []);

  const resetMarks = useCallback(() => {
    setPencilMarks(createEmptyPencilMarks());
  }, []);

  return {
    isNotesMode,
    pencilMarks,
    toggleNotesMode,
    toggleMark,
    clearMarksForCell,
    resetMarks,
    setPencilMarks,
  };
}
