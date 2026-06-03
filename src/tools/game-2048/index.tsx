import React, { useState, useEffect, useCallback, useRef } from 'react';

type Grid = number[][];

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: '#eee4da', text: '#776e65' },
  4: { bg: '#ede0c8', text: '#776e65' },
  8: { bg: '#f2b179', text: '#f9f6f2' },
  16: { bg: '#f59563', text: '#f9f6f2' },
  32: { bg: '#f67c5f', text: '#f9f6f2' },
  64: { bg: '#f65e3b', text: '#f9f6f2' },
  128: { bg: '#edcf72', text: '#f9f6f2' },
  256: { bg: '#edcc61', text: '#f9f6f2' },
  512: { bg: '#edc850', text: '#f9f6f2' },
  1024: { bg: '#edc53f', text: '#f9f6f2' },
  2048: { bg: '#edc22e', text: '#f9f6f2' },
};

function getTileStyle(value: number): { bg: string; text: string } {
  if (TILE_COLORS[value]) return TILE_COLORS[value];
  if (value > 2048) return { bg: '#3c3a32', text: '#f9f6f2' };
  return { bg: '#cdc1b4', text: '#776e65' };
}

function createEmptyGrid(): Grid {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
}

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

function getEmptyCells(grid: Grid): [number, number][] {
  const cells: [number, number][] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) cells.push([r, c]);
    }
  }
  return cells;
}

function addRandomTile(grid: Grid): Grid {
  const empty = getEmptyCells(grid);
  if (empty.length === 0) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return grid;
}

function slideRow(row: number[]): { newRow: number[]; score: number } {
  const filtered = row.filter((v) => v !== 0);
  const merged: number[] = [];
  let score = 0;
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const val = filtered[i] * 2;
      merged.push(val);
      score += val;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i += 1;
    }
  }
  while (merged.length < 4) merged.push(0);
  return { newRow: merged, score };
}

function moveGrid(grid: Grid, direction: 'up' | 'down' | 'left' | 'right'): { grid: Grid; score: number; moved: boolean } {
  let totalScore = 0;
  let moved = false;

  const rotate = (g: Grid): Grid => {
    const size = 4;
    const rotated: Grid = createEmptyGrid();
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        rotated[r][c] = g[c][size - 1 - r];
      }
    }
    return rotated;
  };

  let work = cloneGrid(grid);
  let rotations = 0;

  if (direction === 'up') rotations = 1;
  else if (direction === 'right') rotations = 2;
  else if (direction === 'down') rotations = 3;

  for (let i = 0; i < rotations; i++) {
    work = rotate(work);
  }

  // Now always slide left
  for (let r = 0; r < 4; r++) {
    const { newRow, score } = slideRow(work[r]);
    if (newRow.some((v, i) => v !== work[r][i])) moved = true;
    work[r] = newRow;
    totalScore += score;
  }

  // Rotate back
  for (let i = 0; i < (4 - rotations) % 4; i++) {
    work = rotate(work);
  }

  return { grid: work, score: totalScore, moved };
}

function canMove(grid: Grid): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return true;
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
}

function hasWon(grid: Grid): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] >= 2048) return true;
    }
  }
  return false;
}

const Game2048: React.FC = () => {
  const [grid, setGrid] = useState<Grid>(() => {
    const g = createEmptyGrid();
    addRandomTile(g);
    addRandomTile(g);
    return g;
  });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const gameOverRef = useRef(gameOver);
  const wonRef = useRef(won);
  const keepPlayingRef = useRef(keepPlaying);

  gameOverRef.current = gameOver;
  wonRef.current = won;
  keepPlayingRef.current = keepPlaying;

  const restart = useCallback(() => {
    const g = createEmptyGrid();
    addRandomTile(g);
    addRandomTile(g);
    setGrid(g);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setKeepPlaying(false);
  }, []);

  const doMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOverRef.current) return;
    if (wonRef.current && !keepPlayingRef.current) return;

    setGrid((prev) => {
      const { grid: newGrid, score: moveScore, moved } = moveGrid(prev, direction);
      if (!moved) return prev;

      addRandomTile(newGrid);
      setScore((s) => s + moveScore);

      if (!keepPlayingRef.current && hasWon(newGrid)) {
        setWon(true);
      }

      if (!canMove(newGrid)) {
        setGameOver(true);
      }

      return newGrid;
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': e.preventDefault(); doMove('up'); break;
        case 'ArrowDown': e.preventDefault(); doMove('down'); break;
        case 'ArrowLeft': e.preventDefault(); doMove('left'); break;
        case 'ArrowRight': e.preventDefault(); doMove('right'); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [doMove]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const minSwipe = 30;

    if (Math.max(absDx, absDy) < minSwipe) return;

    if (absDx > absDy) {
      doMove(dx > 0 ? 'right' : 'left');
    } else {
      doMove(dy > 0 ? 'down' : 'up');
    }
  };

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
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      maxWidth: 400,
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 700,
      color: '#E0E0E8',
    },
    scoreBox: {
      background: '#141418',
      borderRadius: 8,
      padding: '8px 20px',
      textAlign: 'center' as const,
    },
    scoreLabel: {
      fontSize: 11,
      color: '#888890',
      textTransform: 'uppercase' as const,
    },
    scoreValue: {
      fontSize: 22,
      fontWeight: 700,
      color: '#ec4899',
    },
    gridContainer: {
      background: '#bbada0',
      borderRadius: 8,
      padding: 8,
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 80px)',
      gridTemplateRows: 'repeat(4, 80px)',
      gap: 8,
      touchAction: 'none' as const,
    },
    cell: {
      borderRadius: 6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 28,
      fontWeight: 700,
      transition: 'all 0.1s ease',
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
    overlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 15, 17, 0.8)',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      zIndex: 10,
    },
    overlayText: {
      color: '#E0E0E8',
      fontSize: 28,
      fontWeight: 700,
      marginBottom: 12,
    },
    overlaySub: {
      color: '#888890',
      fontSize: 14,
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.title}>2048</div>
        <div style={styles.scoreBox}>
          <div style={styles.scoreLabel}>分数</div>
          <div style={styles.scoreValue}>{score}</div>
        </div>
      </div>

      <div
        style={{ position: 'relative' as const }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={styles.gridContainer}>
          {grid.map((row, ri) =>
            row.map((val, ci) => {
              const { bg, text } = getTileStyle(val);
              return (
                <div
                  key={`${ri}-${ci}`}
                  style={{
                    ...styles.cell,
                    background: val === 0 ? '#cdc1b4' : bg,
                    color: text,
                    fontSize: val >= 128 ? 22 : val >= 1024 ? 18 : 28,
                  }}
                >
                  {val !== 0 ? val : ''}
                </div>
              );
            })
          )}
        </div>

        {gameOver && (
          <div style={styles.overlay}>
            <div style={styles.overlayText}>游戏结束!</div>
            <div style={styles.overlaySub}>最终分数: {score}</div>
          </div>
        )}
        {won && !keepPlaying && !gameOver && (
          <div style={styles.overlay}>
            <div style={styles.overlayText}>你赢了!</div>
            <button
              style={{ ...styles.button, marginBottom: 8 }}
              onClick={() => setKeepPlaying(true)}
            >
              继续游戏
            </button>
          </div>
        )}
      </div>

      <button style={styles.button} onClick={restart}>
        重新开始
      </button>
    </div>
  );
};

export default Game2048;
