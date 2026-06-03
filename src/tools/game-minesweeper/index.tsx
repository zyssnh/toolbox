import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Cell {
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacentMines: number;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTIES: Record<Difficulty, { rows: number; cols: number; mines: number }> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

const NUMBER_COLORS: Record<number, string> = {
  1: '#4F8EF7',
  2: '#39D98A',
  3: '#f59e0b',
  4: '#ec4899',
  5: '#ff6b6b',
  6: '#00bcd4',
  7: '#9c27b0',
  8: '#666',
};

function createEmptyBoard(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      revealed: false,
      flagged: false,
      adjacentMines: 0,
    }))
  );
}

function placeMines(board: Cell[][], mines: number, safeR: number, safeC: number): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;
  const positions: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === safeR && c === safeC) continue;
      // also skip neighbors of first click
      if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
      positions.push([r, c]);
    }
  }

  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const toPlace = Math.min(mines, positions.length);
  for (let i = 0; i < toPlace; i++) {
    const [r, c] = positions[i];
    newBoard[r][c].isMine = true;
  }

  // Calculate adjacent mines
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newBoard[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
            count++;
          }
        }
      }
      newBoard[r][c].adjacentMines = count;
    }
  }

  return newBoard;
}

function revealCell(board: Cell[][], r: number, c: number): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;
  if (r < 0 || r >= rows || c < 0 || c >= cols) return board;
  if (board[r][c].revealed || board[r][c].flagged || board[r][c].isMine) return board;

  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const stack: [number, number][] = [[r, c]];

  while (stack.length > 0) {
    const [cr, cc] = stack.pop()!;
    if (newBoard[cr][cc].revealed || newBoard[cr][cc].flagged) continue;
    newBoard[cr][cc].revealed = true;

    if (newBoard[cr][cc].adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = cr + dr;
          const nc = cc + dc;
          if (
            nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
            !newBoard[nr][nc].revealed && !newBoard[nr][nc].flagged && !newBoard[nr][nc].isMine
          ) {
            stack.push([nr, nc]);
          }
        }
      }
    }
  }

  return newBoard;
}

function checkWin(board: Cell[][]): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isMine && !cell.revealed) return false;
    }
  }
  return true;
}

const GameMinesweeper: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<Cell[][]>(() => createEmptyBoard(9, 9));
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [firstClick, setFirstClick] = useState(true);
  const [flagCount, setFlagCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const config = DIFFICULTIES[difficulty];

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const restart = useCallback((diff?: Difficulty) => {
    const d = diff || difficulty;
    setDifficulty(d);
    const cfg = DIFFICULTIES[d];
    setBoard(createEmptyBoard(cfg.rows, cfg.cols));
    setGameState('playing');
    setFirstClick(true);
    setFlagCount(0);
    setTimer(0);
    stopTimer();
  }, [difficulty, stopTimer]);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (gameState === 'won' || gameState === 'lost') return;

    if (firstClick) {
      const newBoard = placeMines(board, config.mines, r, c);
      const revealed = revealCell(newBoard, r, c);
      setBoard(revealed);
      setFirstClick(false);
      startTimer();
      if (checkWin(revealed)) {
        setGameState('won');
        stopTimer();
      }
      return;
    }

    const cell = board[r][c];
    if (cell.revealed || cell.flagged) return;

    if (cell.isMine) {
      setBoard((prev) => {
        const newB = prev.map((row) => row.map((cell) => ({ ...cell })));
        newB[r][c].revealed = true;
        // Reveal all mines
        for (const row of newB) {
          for (const c2 of row) {
            if (c2.isMine) c2.revealed = true;
          }
        }
        return newB;
      });
      setGameState('lost');
      stopTimer();
      return;
    }

    const revealed = revealCell(board, r, c);
    setBoard(revealed);
    if (checkWin(revealed)) {
      setGameState('won');
      stopTimer();
    }
  }, [board, config.mines, firstClick, gameState, startTimer, stopTimer]);

  const handleRightClick = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameState === 'won' || gameState === 'lost') return;

    setBoard((prev) => {
      const cell = prev[r][c];
      if (cell.revealed) return prev;
      const newB = prev.map((row) => row.map((c2) => ({ ...c2 })));
      newB[r][c].flagged = !newB[r][c].flagged;
      return newB;
    });
    setFlagCount((f) => f + (board[r][c].flagged ? -1 : 1));
  }, [board, gameState]);

  const minesLeft = config.mines - flagCount;

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
    header: {
      width: '100%',
      maxWidth: Math.max(360, config.cols * 34 + 8),
      marginBottom: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: 700,
      color: '#E0E0E8',
      textAlign: 'center' as const,
      marginBottom: 12,
    },
    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
      flexWrap: 'wrap' as const,
    },
    difficultyRow: {
      display: 'flex',
      gap: 6,
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
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
      width: '100%',
      maxWidth: config.cols * 34 + 8,
    },
    infoBox: {
      background: '#141418',
      borderRadius: 6,
      padding: '6px 14px',
    },
    infoLabel: {
      fontSize: 10,
      color: '#888890',
    },
    infoValue: {
      fontSize: 18,
      fontWeight: 700,
      color: '#E0E0E8',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${config.cols}, 32px)`,
      gap: 2,
      background: '#0F0F11',
      userSelect: 'none' as const,
    },
    cell: (cell: Cell) => {
      if (cell.revealed) {
        if (cell.isMine) {
          return {
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ff4444',
            borderRadius: 3,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'default' as const,
            color: '#fff',
          };
        }
        return {
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1A1A1F',
          borderRadius: 3,
          fontSize: 15,
          fontWeight: 600,
          cursor: 'default' as const,
          color: NUMBER_COLORS[cell.adjacentMines] || 'transparent',
        };
      }
      return {
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#3a3a42',
        borderRadius: 3,
        border: '1px solid #55555a',
        borderBottom: '2px solid #2a2a30',
        borderRight: '2px solid #2a2a30',
        cursor: 'pointer',
        fontSize: 14,
        color: '#E0E0E8',
      };
    },
    button: {
      background: '#4F8EF7',
      color: 'white',
      border: 'none',
      borderRadius: 6,
      padding: '8px 20px',
      fontSize: 14,
      cursor: 'pointer',
      marginTop: 16,
      fontFamily: "'Noto Sans SC', sans-serif",
    },
    gameOverText: {
      color: '#ff6b6b',
      fontSize: 18,
      fontWeight: 700,
      textAlign: 'center' as const,
      marginTop: 8,
    },
    winText: {
      color: '#39D98A',
      fontSize: 18,
      fontWeight: 700,
      textAlign: 'center' as const,
      marginTop: 8,
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.title}>扫雷</div>
        <div style={{ ...styles.difficultyRow, justifyContent: 'center' }}>
          <button style={styles.diffBtn(difficulty === 'easy')} onClick={() => restart('easy')}>
            简单 9x9 10雷
          </button>
          <button style={styles.diffBtn(difficulty === 'medium')} onClick={() => restart('medium')}>
            中等 16x16 40雷
          </button>
          <button style={styles.diffBtn(difficulty === 'hard')} onClick={() => restart('hard')}>
            困难 16x30 99雷
          </button>
        </div>
      </div>

      <div style={styles.infoRow}>
        <div style={styles.infoBox}>
          <div style={styles.infoLabel}>剩余雷数</div>
          <div style={styles.infoValue}>{minesLeft}</div>
        </div>
        <div style={styles.infoBox}>
          <div style={styles.infoLabel}>时间</div>
          <div style={styles.infoValue}>{timer}s</div>
        </div>
      </div>

      <div style={styles.grid}>
        {board.map((row, ri) =>
          row.map((cell, ci) => (
            <div
              key={`${ri}-${ci}`}
              style={styles.cell(cell)}
              onClick={() => handleCellClick(ri, ci)}
              onContextMenu={(e) => handleRightClick(e, ri, ci)}
            >
              {cell.revealed && cell.isMine
                ? '💣'
                : cell.revealed && cell.adjacentMines > 0
                ? cell.adjacentMines
                : cell.flagged && !cell.revealed
                ? '🚩'
                : ''}
            </div>
          ))
        )}
      </div>

      {gameState === 'lost' && <div style={styles.gameOverText}>游戏结束! 踩到地雷了 💥</div>}
      {gameState === 'won' && <div style={styles.winText}>恭喜! 你赢了! 🎉</div>}

      <button style={styles.button} onClick={() => restart()}>
        重新开始
      </button>
    </div>
  );
};

export default GameMinesweeper;
