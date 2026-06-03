import React, { useState, useCallback, useEffect } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_REMOVE: Record<Difficulty, number> = {
  easy: 30,
  medium: 45,
  hard: 55,
};

const SIZE = 9;
const BOX_SIZE = 3;

type Board = number[][]; // 0 = empty
type FixedBoard = boolean[][]; // true = given cell (immutable)

function createEmptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function isValidPlacement(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < SIZE; c++) {
    if (board[row][c] === num) return false;
  }
  // Check column
  for (let r = 0; r < SIZE; r++) {
    if (board[r][col] === num) return false;
  }
  // Check box
  const boxR = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxC = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = boxR; r < boxR + BOX_SIZE; r++) {
    for (let c = boxC; c < boxC + BOX_SIZE; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}


function solveHelper(board: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValidPlacement(board, r, c, num)) {
            board[r][c] = num;
            if (solveHelper(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generatePuzzle(difficulty: Difficulty): { puzzle: Board; solution: Board; fixedCells: FixedBoard } {
  const board = createEmptyBoard();
  solveHelper(board);

  const solution = cloneBoard(board);
  const puzzle = cloneBoard(board);
  const removeCount = DIFFICULTY_REMOVE[difficulty];

  // Create list of all positions and shuffle
  const positions: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      positions.push([r, c]);
    }
  }
  const shuffled = shuffle(positions);

  let removed = 0;
  for (const [r, c] of shuffled) {
    if (removed >= removeCount) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    // Check that the puzzle still has a unique solution by trying to solve
    // For simplicity, just ensure the removed cell doesn't make it unsolvable
    const testBoard = cloneBoard(puzzle);
    if (solveHelper(testBoard)) {
      // Check uniqueness: try solving with a different number first
      let solutions = 0;
      const testUniq = cloneBoard(puzzle);
      countSolutions(testUniq, () => {
        solutions++;
        return solutions >= 2;
      });
      if (solutions === 1) {
        removed++;
        continue;
      }
    }
    puzzle[r][c] = backup;
  }

  const fixedCells: FixedBoard = puzzle.map((row) => row.map((v) => v !== 0));

  return { puzzle, solution, fixedCells };
}

function countSolutions(board: Board, stopEarly: () => boolean): void {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(board, r, c, num)) {
            board[r][c] = num;
            countSolutions(board, stopEarly);
            if (stopEarly()) return;
            board[r][c] = 0;
          }
        }
        return;
      }
    }
  }
  // Found a complete solution
  stopEarly();
}

function hasConflicts(board: Board, row: number, col: number, num: number): boolean {
  if (num === 0) return false;
  // Check row
  for (let c = 0; c < SIZE; c++) {
    if (c !== col && board[row][c] === num) return true;
  }
  // Check column
  for (let r = 0; r < SIZE; r++) {
    if (r !== row && board[r][col] === num) return true;
  }
  // Check box
  const boxR = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxC = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = boxR; r < boxR + BOX_SIZE; r++) {
    for (let c = boxC; c < boxC + BOX_SIZE; c++) {
      if ((r !== row || c !== col) && board[r][c] === num) return true;
    }
  }
  return false;
}

function isBoardComplete(board: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return false;
    }
  }
  return true;
}

function isBoardValid(board: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const num = board[r][c];
      if (num === 0) continue;
      if (hasConflicts(board, r, c, num)) return false;
    }
  }
  return true;
}

const GameSudoku: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<Board>(() => createEmptyBoard());
  const [fixedCells, setFixedCells] = useState<FixedBoard>(() =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill(false))
  );
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [checkResult, setCheckResult] = useState<'correct' | 'wrong' | null>(null);

  const newGame = useCallback((diff?: Difficulty) => {
    const d = diff || difficulty;
    setDifficulty(d);
    const { puzzle: p, fixedCells: f } = generatePuzzle(d);
    setBoard(p.map((row) => [...row]));
    setFixedCells(f);
    setSelected(null);
    setGameComplete(false);
    setCheckResult(null);
  }, [difficulty]);

  // Initialize on mount
  useEffect(() => {
    newGame();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCellClick = useCallback((r: number, c: number) => {
    if (gameComplete) return;
    if (fixedCells[r][c]) return;
    setSelected({ r, c });
  }, [fixedCells, gameComplete]);

  const placeNumber = useCallback((num: number) => {
    if (!selected || gameComplete) return;
    const { r, c } = selected;
    if (fixedCells[r][c]) return;

    setBoard((prev) => {
      const newBoard = prev.map((row) => [...row]);
      newBoard[r][c] = prev[r][c] === num ? 0 : num;

      if (isBoardComplete(newBoard) && isBoardValid(newBoard)) {
        setGameComplete(true);
      }

      return newBoard;
    });
    setCheckResult(null);
  }, [selected, fixedCells, gameComplete]);

  const handleCheck = useCallback(() => {
    if (isBoardComplete(board)) {
      if (isBoardValid(board)) {
        setCheckResult('correct');
      } else {
        setCheckResult('wrong');
      }
    } else {
      setCheckResult('wrong');
    }
  }, [board]);

  // Keyboard input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameComplete) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        placeNumber(num);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        placeNumber(0);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        setSelected((prev) => {
          if (!prev) {
            return { r: 0, c: 0 };
          }
          let { r, c } = prev;
          switch (e.key) {
            case 'ArrowUp': r = Math.max(0, r - 1); break;
            case 'ArrowDown': r = Math.min(8, r + 1); break;
            case 'ArrowLeft': c = Math.max(0, c - 1); break;
            case 'ArrowRight': c = Math.min(8, c + 1); break;
          }
          return { r, c };
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [placeNumber, gameComplete]);

  const selectedNum = selected ? board[selected.r][selected.c] : null;
  const sameNumCells: Set<string> = new Set();
  if (selectedNum && selectedNum > 0) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === selectedNum) {
          sameNumCells.add(`${r},${c}`);
        }
      }
    }
  }

  const conflictCells: Set<string> = new Set();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const num = board[r][c];
      if (num > 0 && hasConflicts(board, r, c, num)) {
        conflictCells.add(`${r},${c}`);
      }
    }
  }

  const styles = {
    wrapper: {
      padding: 20,
      background: '#0F0F11',
      minHeight: '100%',
      color: '#E0E0E8',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      fontFamily: "'Noto Sans SC', sans-serif",
    },
    title: {
      fontSize: 24,
      fontWeight: 700,
      color: '#E0E0E8',
      marginBottom: 12,
    },
    difficultyRow: {
      display: 'flex',
      gap: 6,
      marginBottom: 16,
    },
    diffBtn: (active: boolean) => ({
      background: active ? '#4F8EF7' : '#141418',
      color: active ? 'white' : '#888890',
      border: 'none',
      borderRadius: 6,
      padding: '6px 14px',
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: "'Noto Sans SC', sans-serif",
    }),
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(9, 40px)',
      gridTemplateRows: 'repeat(9, 40px)',
      gap: 0,
      border: '2px solid #4F8EF7',
      borderRadius: 4,
      overflow: 'hidden',
      userSelect: 'none' as const,
    },
    cell: (r: number, c: number): React.CSSProperties => {
      const isSelected = selected?.r === r && selected?.c === c;
      const isSameNum = sameNumCells.has(`${r},${c}`);
      const isConflict = conflictCells.has(`${r},${c}`);
      const isFixed = fixedCells[r][c];
      const isBoxBorderR = r % BOX_SIZE === BOX_SIZE - 1 && r < SIZE - 1;
      const isBoxBorderC = c % BOX_SIZE === BOX_SIZE - 1 && c < SIZE - 1;

      let bg = '#1A1A1F';
      if (isSelected) bg = '#1e2d44';
      else if (isSameNum && !isSelected) bg = '#181e2b';

      return {
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        borderRight: isBoxBorderC ? '2px solid #4F8EF7' : '0.5px solid #2a2a30',
        borderBottom: isBoxBorderR ? '2px solid #4F8EF7' : '0.5px solid #2a2a30',
        fontSize: 18,
        fontWeight: isFixed ? 700 : 500,
        color: isConflict ? '#ff6b6b' : isFixed ? '#E0E0E8' : '#4F8EF7',
        cursor: isFixed ? 'default' : 'pointer',
        outline: isSelected ? '1px solid #4F8EF7' : 'none',
        boxSizing: 'border-box' as const,
      };
    },
    numPad: {
      display: 'grid',
      gridTemplateColumns: 'repeat(9, 36px)',
      gap: 4,
      marginTop: 16,
    },
    numBtn: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#141418',
      color: '#E0E0E8',
      border: '0.5px solid #2a2a30',
      borderRadius: 6,
      fontSize: 16,
      cursor: 'pointer',
      fontFamily: "'Noto Sans SC', sans-serif",
    },
    actionRow: {
      display: 'flex',
      gap: 8,
      marginTop: 16,
    },
    button: {
      background: '#4F8EF7',
      color: 'white',
      border: 'none',
      borderRadius: 6,
      padding: '8px 20px',
      fontSize: 14,
      cursor: 'pointer',
      fontFamily: "'Noto Sans SC', sans-serif",
    },
    secondaryButton: {
      background: '#141418',
      color: '#E0E0E8',
      border: '0.5px solid #2a2a30',
      borderRadius: 6,
      padding: '8px 20px',
      fontSize: 14,
      cursor: 'pointer',
      fontFamily: "'Noto Sans SC', sans-serif",
    },
    completeText: {
      color: '#39D98A',
      fontSize: 18,
      fontWeight: 700,
      marginTop: 8,
    },
    wrongText: {
      color: '#ff6b6b',
      fontSize: 14,
      marginTop: 4,
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.title}>数独</div>

      <div style={styles.difficultyRow}>
        <button style={styles.diffBtn(difficulty === 'easy')} onClick={() => newGame('easy')}>
          简单
        </button>
        <button style={styles.diffBtn(difficulty === 'medium')} onClick={() => newGame('medium')}>
          中等
        </button>
        <button style={styles.diffBtn(difficulty === 'hard')} onClick={() => newGame('hard')}>
          困难
        </button>
      </div>

      <div style={styles.gridContainer}>
        {board.map((row, ri) =>
          row.map((val, ci) => (
            <div
              key={`${ri}-${ci}`}
              style={styles.cell(ri, ci)}
              onClick={() => handleCellClick(ri, ci)}
            >
              {val !== 0 ? val : ''}
            </div>
          ))
        )}
      </div>

      <div style={styles.numPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            style={styles.numBtn}
            onClick={() => placeNumber(num)}
            onMouseDown={(e) => e.preventDefault()}
          >
            {num}
          </button>
        ))}
      </div>

      <div style={styles.actionRow}>
        <button style={styles.secondaryButton} onClick={handleCheck}>
          检查答案
        </button>
        <button style={styles.button} onClick={() => newGame()}>
          新游戏
        </button>
      </div>

      {gameComplete && <div style={styles.completeText}>完成! 🎉</div>}
      {checkResult === 'correct' && (
        <div style={{ color: '#39D98A', fontSize: 14, marginTop: 4 }}>
          答案正确!
        </div>
      )}
      {checkResult === 'wrong' && (
        <div style={styles.wrongText}>
          还有错误，请检查红色标记的格子
        </div>
      )}
    </div>
  );
};

export default GameSudoku;
