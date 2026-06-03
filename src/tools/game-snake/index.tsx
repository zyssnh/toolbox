import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../theme';

const GRID_SIZE = 20;
const CELL_SIZE = 18;
const GAP = 1;
const CANVAS = GRID_SIZE * (CELL_SIZE + GAP) + GAP;

type Position = { x: number; y: number };

function newFood(snake: Position[]): Position {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
  const available: Position[] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!occupied.has(`${x},${y}`)) {
        available.push({ x, y });
      }
    }
  }
  if (available.length === 0) return { x: 0, y: 0 };
  return available[Math.floor(Math.random() * available.length)];
}

function getInitialSnake(): Position[] {
  const mid = Math.floor(GRID_SIZE / 2);
  return [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
}

const GameSnake: React.FC = () => {
  const t = useTheme();

  const [snake, setSnake] = useState<Position[]>(getInitialSnake);
  const [food, setFood] = useState<Position>(() => newFood(getInitialSnake()));
  const [direction, setDirection] = useState<{ x: number; y: number }>({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('snake-high-score') || '0', 10) || 0;
    } catch {
      return 0;
    }
  });
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  const directionRef = useRef(direction);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const scoreRef = useRef(score);
  const gameOverRef = useRef(gameOver);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  directionRef.current = direction;
  snakeRef.current = snake;
  foodRef.current = food;
  scoreRef.current = score;
  gameOverRef.current = gameOver;

  const updateHighScore = useCallback((s: number) => {
    setHighScore((prev) => {
      if (s > prev) {
        try {
          localStorage.setItem('snake-high-score', String(s));
        } catch { /* ignore */ }
        return s;
      }
      return prev;
    });
  }, []);

  const tick = useCallback(() => {
    if (gameOverRef.current) return;

    const dir = directionRef.current;
    const currentSnake = snakeRef.current;
    const head = currentSnake[0];
    const newHead = { x: head.x + dir.x, y: head.y + dir.y };

    // Wall collision
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      setGameOver(true);
      updateHighScore(scoreRef.current);
      return;
    }

    // Self collision (skip tail since it will move)
    const willGrow = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
    const checkLength = willGrow ? currentSnake.length : currentSnake.length - 1;
    for (let i = 0; i < checkLength; i++) {
      if (currentSnake[i].x === newHead.x && currentSnake[i].y === newHead.y) {
        setGameOver(true);
        updateHighScore(scoreRef.current);
        return;
      }
    }

    const newSnake = [newHead, ...currentSnake];
    if (willGrow) {
      const newScore = scoreRef.current + 10;
      setScore(newScore);
      const f = newFood(newSnake);
      setFood(f);
      foodRef.current = f;
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
    snakeRef.current = newSnake;
  }, [updateHighScore]);

  const restart = useCallback(() => {
    const s = getInitialSnake();
    const f = newFood(s);
    setSnake(s);
    setFood(f);
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
    setPaused(false);
    snakeRef.current = s;
    foodRef.current = f;
    directionRef.current = { x: 1, y: 0 };
    scoreRef.current = 0;
    gameOverRef.current = false;
  }, []);

  // Game loop
  useEffect(() => {
    const speed = Math.max(80, 200 - score * 2);
    intervalRef.current = setInterval(tick, speed);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [score, tick]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const dir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (dir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (dir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (dir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (dir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          e.preventDefault();
          if (!gameOverRef.current) setPaused((p) => !p);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const snakeSet = new Set(snake.map((p) => `${p.x},${p.y}`));

  const styles = {
    wrapper: {
      padding: 20,
      background: t.bg,
      minHeight: '100%',
      color: t.text,
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
      maxWidth: CANVAS,
      marginBottom: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: 700,
      color: t.text,
    },
    scores: {
      display: 'flex',
      gap: 16,
    },
    scoreBox: {
      background: t.card,
      borderRadius: 8,
      padding: '6px 16px',
      textAlign: 'center' as const,
    },
    scoreLabel: {
      fontSize: 10,
      color: t.textSecondary,
      textTransform: 'uppercase' as const,
    },
    scoreValue: {
      fontSize: 20,
      fontWeight: 700,
      color: t.green,
    },
    highScoreValue: {
      fontSize: 20,
      fontWeight: 700,
      color: t.pink,
    },
    canvas: {
      position: 'relative' as const,
      width: CANVAS,
      height: CANVAS,
      background: t.card,
      borderRadius: 8,
      overflow: 'hidden',
    },
    cell: {
      position: 'absolute' as const,
      width: CELL_SIZE,
      height: CELL_SIZE,
      borderRadius: 3,
    },
    button: {
      background: t.primary,
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
      background: t.card,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      zIndex: 10,
    },
    overlayText: {
      color: t.text,
      fontSize: 24,
      fontWeight: 700,
      marginBottom: 8,
    },
    overlaySub: {
      color: t.textSecondary,
      fontSize: 14,
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.title}>贪吃蛇</div>
        <div style={styles.scores}>
          <div style={styles.scoreBox}>
            <div style={styles.scoreLabel}>分数</div>
            <div style={styles.scoreValue}>{score}</div>
          </div>
          <div style={styles.scoreBox}>
            <div style={styles.scoreLabel}>最高</div>
            <div style={styles.highScoreValue}>{highScore}</div>
          </div>
        </div>
      </div>

      <div style={styles.canvas}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const key = `${x},${y}`;
          const isSnake = snakeSet.has(key);
          const isFood = food.x === x && food.y === y;
          if (!isSnake && !isFood) return null;

          const head = snake[0];
          return (
            <div
              key={key}
              style={{
                ...styles.cell,
                left: GAP + x * (CELL_SIZE + GAP),
                top: GAP + y * (CELL_SIZE + GAP),
                background: isFood
                  ? '#ff6b6b'
                  : head && head.x === x && head.y === y
                  ? '#2ecc71'
                  : t.green,
                boxShadow:
                  head && head.x === x && head.y === y
                    ? '0 0 6px rgba(46, 204, 113, 0.5)'
                    : undefined,
              }}
            />
          );
        })}

        {gameOver && (
          <div style={styles.overlay}>
            <div style={styles.overlayText}>游戏结束!</div>
            <div style={styles.overlaySub}>得分: {score}</div>
          </div>
        )}

        {paused && !gameOver && (
          <div style={styles.overlay}>
            <div style={{ ...styles.overlayText, fontSize: 20 }}>已暂停</div>
            <div style={styles.overlaySub}>按空格键继续</div>
          </div>
        )}
      </div>

      <button style={styles.button} onClick={restart}>
        重新开始
      </button>
    </div>
  );
};

export default GameSnake;
