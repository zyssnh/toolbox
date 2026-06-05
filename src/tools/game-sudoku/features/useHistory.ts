import { useState, useCallback } from 'react';
import type { Board, Move, PencilMarks } from '../types';
import { cloneBoard, clonePencilMarks } from '../logic';

export function useHistory(initialBoard: Board, initialPencil?: PencilMarks) {
  const [history, setHistory] = useState<Move[]>([]);
  const [boardSnapshots, setBoardSnapshots] = useState<Board[]>([cloneBoard(initialBoard)]);
  const [pencilSnapshots, setPencilSnapshots] = useState<PencilMarks[]>([
    initialPencil ? clonePencilMarks(initialPencil) : [],
  ]);

  const pushMove = useCallback(
    (move: Move, newBoard: Board, newPencil?: PencilMarks) => {
      setHistory((prev) => [...prev, move]);
      setBoardSnapshots((prev) => [...prev, cloneBoard(newBoard)]);
      if (newPencil) {
        setPencilSnapshots((prev) => [...prev, clonePencilMarks(newPencil)]);
      } else if (pencilSnapshots.length > 0) {
        setPencilSnapshots((prev) => [...prev, prev[prev.length - 1]]);
      }
    },
    [pencilSnapshots],
  );

  const undo = useCallback((): {
    board: Board;
    pencil: PencilMarks | null;
  } | null => {
    if (boardSnapshots.length <= 1) return null;
    setHistory((prev) => prev.slice(0, -1));
    setBoardSnapshots((prev) => {
      const next = prev.slice(0, -1);
      return next;
    });
    setPencilSnapshots((prev) => {
      const next = prev.slice(0, -1);
      return next;
    });

    const restoredBoard = boardSnapshots[boardSnapshots.length - 2];
    const restoredPencil = pencilSnapshots.length > 1 ? pencilSnapshots[pencilSnapshots.length - 2] : null;
    return {
      board: cloneBoard(restoredBoard),
      pencil: restoredPencil ? clonePencilMarks(restoredPencil) : null,
    };
  }, [boardSnapshots, pencilSnapshots]);

  const reset = useCallback((newBoard: Board, newPencil?: PencilMarks) => {
    setHistory([]);
    setBoardSnapshots([cloneBoard(newBoard)]);
    setPencilSnapshots([newPencil ? clonePencilMarks(newPencil) : []]);
  }, []);

  return {
    history,
    canUndo: boardSnapshots.length > 1,
    pushMove,
    undo,
    reset,
  };
}
