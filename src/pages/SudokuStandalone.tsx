import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useAppStore } from '../store/useAppStore';
import type { Difficulty, Board, FixedBoard } from '../tools/game-sudoku/types';
import { SIZE, BOX_SIZE, DIFFICULTY_LABELS } from '../tools/game-sudoku/types';
import {
  createEmptyBoard,
  generatePuzzle,
  hasConflicts,
  isBoardComplete,
  isBoardValid,
} from '../tools/game-sudoku/logic';
import { useTimer } from '../tools/game-sudoku/features/useTimer';
import { useHistory } from '../tools/game-sudoku/features/useHistory';
import { usePencilMarks } from '../tools/game-sudoku/features/usePencilMarks';
import { useHint } from '../tools/game-sudoku/features/useHint';
import { useStatistics } from '../tools/game-sudoku/features/useStatistics';
import {
  SudokuThemeProvider,
  useSudokuTheme,
  sudokuThemes,
  getSudokuTheme,
} from '../tools/game-sudoku/themes';

/** Yields to the browser's event loop so the UI can paint before heavy work */
function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => setTimeout(resolve, 0));
  });
}

/* ================================================================
   Inner Component (wrapped in SudokuThemeProvider)
   ================================================================ */
const SudokuStandaloneInner: React.FC = () => {
  const theme = useSudokuTheme();
  const globalTheme = useAppStore((s) => s.theme);
  const toggleGlobalTheme = useAppStore((s) => s.toggleTheme);

  // ---- Game state ----
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<Board>(() => createEmptyBoard());
  const [solution, setSolution] = useState<Board>(() => createEmptyBoard());
  const [fixedCells, setFixedCells] = useState<FixedBoard>(() =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill(false)),
  );
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isBoardReady, setIsBoardReady] = useState(false);

  // ---- Features ----
  const timer = useTimer();
  const { recordCompletion, formattedBestTime } = useStatistics();
  const {
    canUndo,
    pushMove,
    undo,
    reset: resetHistory,
  } = useHistory(board);
  const {
    isNotesMode,
    pencilMarks,
    toggleNotesMode,
    toggleMark,
    clearMarksForCell,
    resetMarks,
    setPencilMarks,
  } = usePencilMarks(board, fixedCells);
  const { hintCount, hintCell, requestHint, resetHints } = useHint();
  const [moveCount, setMoveCount] = useState(0);

  // ---- New game ----
  const newGame = useCallback(
    async (diff?: Difficulty) => {
      const d = diff || difficulty;
      setDifficulty(d);
      setIsBoardReady(false);
      // Yield to browser so the UI can update (showing loading state)
      await yieldToBrowser();
      const { puzzle: p, solution: s, fixedCells: f } = generatePuzzle(d);
      setBoard(p.map((row) => [...row]));
      setSolution(s);
      setFixedCells(f);
      setSelected(null);
      setGameComplete(false);
      setIsPaused(false);
      setShowCompletion(false);
      setMoveCount(0);
      timer.reset();
      resetHistory(p);
      resetMarks();
      resetHints();
      // Brief delay so the entrance animation plays after state settles
      requestAnimationFrame(() => {
        setIsBoardReady(true);
      });
    },
    [difficulty, timer, resetHistory, resetMarks, resetHints],
  );

  // Initialize
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      newGame('easy');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Cell interaction ----
  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (gameComplete || isPaused) return;
      setSelected({ r, c });
    },
    [gameComplete, isPaused],
  );

  // ---- Place number / toggle mark ----
  const handleNumberInput = useCallback(
    (num: number) => {
      if (!selected || gameComplete || isPaused) return;
      const { r, c } = selected;
      if (fixedCells[r][c]) return;

      if (isNotesMode) {
        // Toggle pencil mark
        if (num === 0) {
          // Erase all marks for this cell
          setPencilMarks((prev) => {
            const next = prev.map((row) => [...row]);
            next[r][c] = null;
            return next;
          });
        } else {
          toggleMark(r, c, num);
        }
        return;
      }

      // Normal mode: place number
      if (num === 0 || board[r][c] === num) {
        // Erase
        const prevVal = board[r][c];
        if (prevVal === 0) return;
        setBoard((prev) => {
          const next = prev.map((row) => [...row]);
          next[r][c] = 0;
          return next;
        });
        pushMove(
          { r, c, prevValue: prevVal, newValue: 0 },
          board.map((row) => [...row]),
        );
        setMoveCount((p) => p + 1);
      } else {
        // Place number
        const prevVal = board[r][c];
        setBoard((prev) => {
          const next = prev.map((row) => [...row]);
          next[r][c] = num;
          return next;
        });
        clearMarksForCell(r, c);
        pushMove(
          { r, c, prevValue: prevVal, newValue: num },
          board.map((row) => [...row]),
        );
        setMoveCount((p) => p + 1);

        // Start timer on first move
        if (!timer.isRunning && prevVal === 0) {
          timer.start();
        }
      }
    },
    [
      selected,
      gameComplete,
      isPaused,
      fixedCells,
      isNotesMode,
      board,
      timer,
      toggleMark,
      clearMarksForCell,
      pushMove,
      setPencilMarks,
    ],
  );

  // ---- Undo ----
  const handleUndo = useCallback(() => {
    if (!canUndo || gameComplete || isPaused) return;
    const result = undo();
    if (result) {
      setBoard(result.board);
      if (result.pencil) setPencilMarks(result.pencil);
      setMoveCount((p) => Math.max(0, p - 1));
    }
  }, [canUndo, gameComplete, isPaused, undo, setPencilMarks]);

  // ---- Hint ----
  const handleHint = useCallback(() => {
    if (gameComplete || isPaused) return;
    const hint = requestHint(board, solution);
    if (hint) {
      setBoard((prev) => {
        const next = prev.map((row) => [...row]);
        next[hint.r][hint.c] = hint.value;
        return next;
      });
      clearMarksForCell(hint.r, hint.c);
      if (!timer.isRunning) timer.start();
      setMoveCount((p) => p + 1);
    }
  }, [board, solution, gameComplete, isPaused, requestHint, timer, clearMarksForCell]);

  // ---- Pause ----
  const handlePause = useCallback(() => {
    if (gameComplete) return;
    if (isPaused) {
      setIsPaused(false);
      if (moveCount > 0) timer.start();
    } else {
      setIsPaused(true);
      timer.pause();
    }
  }, [isPaused, gameComplete, moveCount, timer]);

  // ---- Completion detection ----
  useEffect(() => {
    if (
      !gameComplete &&
      moveCount > 0 &&
      isBoardComplete(board) &&
      isBoardValid(board)
    ) {
      setGameComplete(true);
      setShowCompletion(true);
      timer.pause();
      recordCompletion(difficulty, timer.elapsed);
    }
  }, [board, gameComplete, moveCount, timer, difficulty, recordCompletion]);

  // ---- Keyboard ----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameComplete || isPaused) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        handleNumberInput(num);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleNumberInput(0);
      } else if (e.key === '0') {
        handleNumberInput(0);
      } else if (e.key === 'n' || e.key === 'N') {
        toggleNotesMode();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        e.preventDefault();
        setSelected((prev) => {
          if (!prev) return { r: 0, c: 0 };
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
  }, [handleNumberInput, handleUndo, toggleNotesMode, gameComplete, isPaused]);

  // ---- Derived display data ----
  const selectedNum = selected ? board[selected.r][selected.c] : null;
  const sameNumCells = new Set<string>();
  if (selectedNum && selectedNum > 0) {
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (board[r][c] === selectedNum) sameNumCells.add(`${r},${c}`);
  }
  const conflictCells = new Set<string>();
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const n = board[r][c];
      if (n > 0 && hasConflicts(board, r, c, n)) conflictCells.add(`${r},${c}`);
    }

  // Determine same row/col/box for selected cell
  const isSameRowColBox = (r: number, c: number): boolean => {
    if (!selected) return false;
    return (
      selected.r === r ||
      selected.c === c ||
      (Math.floor(r / BOX_SIZE) === Math.floor(selected.r / BOX_SIZE) &&
        Math.floor(c / BOX_SIZE) === Math.floor(selected.c / BOX_SIZE))
    );
  };
  const isHintCell = (r: number, c: number): boolean =>
    hintCell?.r === r && hintCell?.c === c;

  // ---- Styles (theme-driven) ----
  const T = theme.colors;
  const E = theme.effects || {};

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: T.pageBgMesh || T.pageBg,
    fontFamily: theme.fonts.ui,
    color: T.textColor,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  };

  const topBarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    background: T.panelBg,
    borderBottom: `0.5px solid ${T.dividerColor}`,
    backdropFilter: E.boardBackdrop || 'none',
    WebkitBackdropFilter: E.boardBackdrop || 'none',
    zIndex: 10,
  };

  const boardOuterStyle: React.CSSProperties = {
    background: T.boardBg,
    border: `2px solid ${T.boardBorder}`,
    borderRadius: E.cellBorderRadius || '8px',
    backdropFilter: E.boardBackdrop || 'none',
    WebkitBackdropFilter: E.boardBackdrop || 'none',
    boxShadow: E.panelShadow || 'none',
    overflow: 'hidden',
    userSelect: 'none',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(9, minmax(36px, 48px))`,
    gridTemplateRows: `repeat(9, minmax(36px, 48px))`,
    gap: 0,
  };

  const cellStyle = (r: number, c: number): React.CSSProperties => {
    const isF = fixedCells[r][c];
    const isSel = selected?.r === r && selected?.c === c;
    const isSame = sameNumCells.has(`${r},${c}`);
    const isConflict = conflictCells.has(`${r},${c}`);
    const isBoxBtm = r % BOX_SIZE === BOX_SIZE - 1 && r < SIZE - 1;
    const isBoxRgt = c % BOX_SIZE === BOX_SIZE - 1 && c < SIZE - 1;
    const isHover = isSameRowColBox(r, c);
    const isHint = isHintCell(r, c);

    let bg = T.cellBg;
    if (isSel) bg = T.cellSelectedBg;
    else if (isSame && !isSel) bg = T.cellSameNumBg;
    else if (isHover) bg = T.cellHighlightBg;

    let color = T.givenNumColor;
    if (isConflict) color = T.errorColor;
    else if (!isF) color = T.userNumColor;

    return {
      width: '100%',
      aspectRatio: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: bg,
      borderRight: isBoxRgt
        ? `2px solid ${T.boxBorder}`
        : `0.5px solid ${T.cellBorder}`,
      borderBottom: isBoxBtm
        ? `2px solid ${T.boxBorder}`
        : `0.5px solid ${T.cellBorder}`,
      fontSize: 'clamp(16px, 3.5vw, 22px)',
      fontWeight: isF ? 700 : 500,
      fontFamily: theme.fonts.board,
      color,
      cursor: isF ? 'default' : 'pointer',
      boxShadow: isSel
        ? `inset 0 0 0 2px ${T.accentColor}`
        : isHint
          ? `inset 0 0 0 2px ${T.accentColor}`
          : 'none',
      boxSizing: 'border-box' as const,
      transition: 'background 0.15s ease, box-shadow 0.15s ease',
      position: 'relative' as const,
    };
  };

  const pencilStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 2,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(3, 1fr)',
    alignItems: 'center',
    justifyItems: 'center',
    fontSize: 'clamp(6px, 1.2vw, 9px)',
    color: T.pencilMarkColor,
    fontFamily: theme.fonts.board,
    pointerEvents: 'none',
    lineHeight: 1,
  };

  const btnStyle = (isAccent?: boolean): React.CSSProperties => ({
    background: isAccent ? T.accentColor : T.buttonBg,
    color: isAccent ? '#fff' : T.buttonText,
    border: 'none',
    borderRadius: 8,
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: theme.fonts.ui,
    transition: 'background 0.15s ease, transform 0.1s ease',
  });

  const iconBtnStyle: React.CSSProperties = {
    ...btnStyle(),
    padding: '10px',
    minWidth: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
  };

  // ---- Responsive breakpoint ----
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < 680);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ================================================================
  //  RENDER
  // ================================================================
  // ---- Memoized board grid (avoids re-rendering all cells on every state change) ----
  const boardGrid = useMemo(() => {
    return board.map((row, ri) =>
      row.map((val, ci) => {
        const marks = pencilMarks[ri][ci];
        return (
          <div
            key={`${ri}-${ci}`}
            style={cellStyle(ri, ci)}
            onClick={() => handleCellClick(ri, ci)}
          >
            {val !== 0 ? (
              val
            ) : marks && marks.size > 0 ? (
              <div style={pencilStyle}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <span key={n}>{marks.has(n) ? n : ''}</span>
                ))}
              </div>
            ) : null}
          </div>
        );
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, pencilMarks, selected, sameNumCells.size, conflictCells.size, hintCell]);

  // ---- Skeleton grid (shown while puzzle generates) ----
  const skeletonGrid = useMemo(() => {
    return Array.from({ length: SIZE }, (_, ri) =>
      Array.from({ length: SIZE }, (_, ci) => (
        <div
          key={`sk-${ri}-${ci}`}
          style={{
            width: '100%',
            aspectRatio: '1',
            borderRight:
              ci % BOX_SIZE === BOX_SIZE - 1 && ci < SIZE - 1
                ? `2px solid ${T.boxBorder}`
                : `0.5px solid ${T.cellBorder}`,
            borderBottom:
              ri % BOX_SIZE === BOX_SIZE - 1 && ri < SIZE - 1
                ? `2px solid ${T.boxBorder}`
                : `0.5px solid ${T.cellBorder}`,
            boxSizing: 'border-box' as const,
          }}
        >
          <div
            className="sudoku-skeleton-cell"
            style={{
              width: '100%',
              height: '100%',
              background: T.cellHighlightBg,
              borderRadius: 2,
            }}
          />
        </div>
      )),
    );
  }, [T.boxBorder, T.cellBorder, T.cellHighlightBg]);

  // Memoized numpad
  const numPad = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          style={{
            ...btnStyle(),
            width: isNarrow ? undefined : 52,
            height: 52,
            fontSize: 20,
            fontWeight: 600,
            fontFamily: theme.fonts.board,
          }}
          onClick={() => handleNumberInput(num)}
          onMouseDown={(e) => e.preventDefault()}
        >
          {num}
        </button>
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isNarrow, T.buttonBg, T.buttonText, T.accentColor, theme.fonts.board],
  );

  return (
    <div
      style={pageStyle}
      className={`${theme.id === 'glassmorphism' ? 'sudoku-glass-bg' : ''} sudoku-page-enter`}
    >
      {/* Top bar */}
      <div style={topBarStyle}>
        <Link
          to="/" search={{}}
          style={{
            color: T.textSecondary,
            fontSize: 13,
            textDecoration: 'none',
            padding: '6px 12px',
            background: T.buttonBg,
            borderRadius: 6,
          }}
        >
          ← 工具箱
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Sudoku theme switcher */}
          <div style={{ display: 'flex', gap: 4, background: T.buttonBg, borderRadius: 8, padding: 3 }}>
            {sudokuThemes.map((st) => (
              <button
                key={st.id}
                onClick={() => useAppStore.getState().setSudokuTheme(st.id)}
                style={{
                  background: theme.id === st.id ? T.accentColor : 'transparent',
                  color: theme.id === st.id ? '#fff' : T.textSecondary,
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: theme.fonts.ui,
                  transition: 'all 0.15s ease',
                }}
                title={st.name}
              >
                {st.icon} {st.name}
              </button>
            ))}
          </div>

          {/* Global dark/light toggle */}
          <button
            onClick={toggleGlobalTheme}
            style={{
              background: T.buttonBg,
              color: T.textSecondary,
              border: 'none',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 15,
              cursor: 'pointer',
              lineHeight: 1,
            }}
            title={globalTheme === 'dark' ? '浅色模式' : '深色模式'}
          >
            {globalTheme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Pause */}
          <button
            onClick={handlePause}
            style={{
              background: T.buttonBg,
              color: T.textSecondary,
              border: 'none',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 15,
              cursor: 'pointer',
              lineHeight: 1,
            }}
            title="暂停"
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          padding: '10px 16px',
          fontSize: 14,
          color: T.textSecondary,
          background: T.panelBg,
          borderBottom: `0.5px solid ${T.dividerColor}`,
          backdropFilter: E.boardBackdrop || 'none',
          WebkitBackdropFilter: E.boardBackdrop || 'none',
        }}
      >
        <span>⏱️ {timer.formattedTime}</span>
        <span>📝 {moveCount} 步</span>
        <span>💡 {hintCount} 提示</span>
        <span>🏆 {formattedBestTime(difficulty)}</span>
        <span style={{ color: T.accentColor, fontWeight: 600, fontSize: 13 }}>
          {DIFFICULTY_LABELS[difficulty]}
        </span>
      </div>

      {/* Main game area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: isNarrow ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isNarrow ? 16 : 32,
          padding: isNarrow ? '16px 8px' : '20px',
        }}
      >
        {/* Board */}
        <div
          style={boardOuterStyle}
          className={isBoardReady ? 'sudoku-board-enter' : ''}
        >
          <div style={gridStyle}>
            {isBoardReady ? boardGrid : skeletonGrid}
          </div>
        </div>

        {/* Control panel */}
        <div
          className={isBoardReady ? 'sudoku-panel-enter' : ''}
          style={{
            display: 'flex',
            flexDirection: isNarrow ? 'row' : 'column',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Numpad */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isNarrow ? 'repeat(9, 1fr)' : 'repeat(3, 1fr)',
              gap: 6,
            }}
          >
            {numPad}
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: isNarrow ? 'row' : 'column',
              gap: 6,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {/* Notes mode toggle */}
            <button
              style={{
                ...btnStyle(),
                background: isNotesMode ? T.accentColor : T.buttonBg,
                color: isNotesMode ? '#fff' : T.buttonText,
              }}
              onClick={toggleNotesMode}
            >
              ✏️ {isNotesMode ? '笔记:开' : '笔记'}
            </button>

            {/* Erase */}
            <button
              style={iconBtnStyle}
              onClick={() => handleNumberInput(0)}
              title="擦除 (Backspace)"
            >
              ⌫
            </button>

            {/* Undo */}
            <button
              style={{
                ...iconBtnStyle,
                opacity: canUndo ? 1 : 0.4,
              }}
              onClick={handleUndo}
              disabled={!canUndo}
              title="撤销 (Ctrl+Z)"
            >
              ↩️
            </button>

            {/* Hint */}
            <button
              style={iconBtnStyle}
              onClick={handleHint}
              title="提示"
            >
              💡
            </button>

            {/* New game */}
            <button
              style={{
                ...btnStyle(true),
                marginTop: isNarrow ? 0 : 8,
              }}
              onClick={() => { void newGame(); }}
            >
              🆕 新游戏
            </button>

            {/* Difficulty quick switch */}
            <div
              style={{
                display: 'flex',
                gap: 4,
                marginTop: isNarrow ? 0 : 8,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                <button
                  key={d}
                  style={{
                    background: difficulty === d ? T.accentColor : T.buttonBg,
                    color: difficulty === d ? '#fff' : T.textSecondary,
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: theme.fonts.ui,
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => { void newGame(d); }}
                >
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Zen seal decoration */}
      {theme.decorations?.cornerSealSvg && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            opacity: 0.6,
            pointerEvents: 'none',
            transform: 'rotate(-8deg)',
          }}
          dangerouslySetInnerHTML={{ __html: theme.decorations.cornerSealSvg }}
        />
      )}

      {/* ===================== PAUSE OVERLAY ===================== */}
      {isPaused && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: T.overlayBg,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={handlePause}
        >
          <div style={{ fontSize: 48, fontWeight: 700, color: T.textColor }}>
            ⏸️ 已暂停
          </div>
          <div style={{ fontSize: 16, color: T.textSecondary }}>
            点击任意位置继续游戏
          </div>
        </div>
      )}

      {/* ===================== COMPLETION DIALOG ===================== */}
      {showCompletion && (
        <div
          className="sudoku-dialog-pop"
          style={{
            position: 'fixed',
            inset: 0,
            background: T.overlayBg,
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div
            style={{
              background: T.panelBg,
              border: `1px solid ${T.dividerColor}`,
              borderRadius: 16,
              padding: '32px 40px',
              textAlign: 'center',
              backdropFilter: E.boardBackdrop || 'none',
              WebkitBackdropFilter: E.boardBackdrop || 'none',
              boxShadow: E.panelShadow || 'none',
              maxWidth: 360,
              width: '90%',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: T.textColor,
                marginBottom: 4,
              }}
            >
              恭喜完成!
            </div>
            <div
              style={{
                fontSize: 14,
                color: T.textSecondary,
                marginBottom: 20,
                fontFamily: theme.fonts.ui,
              }}
            >
              {DIFFICULTY_LABELS[difficulty]} · {timer.formattedTime} · {moveCount} 步
              {hintCount > 0 && ` · ${hintCount} 次提示`}
            </div>
            <button
              style={{
                ...btnStyle(true),
                padding: '12px 32px',
                fontSize: 16,
                fontWeight: 600,
              }}
              onClick={() => {
                setShowCompletion(false);
                void newGame();
              }}
            >
              🆕 再来一局
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================================================================
   Outer Component (provides theme context)
   ================================================================ */
const SudokuStandalone: React.FC = () => {
  const sudokuThemeId = useAppStore((s) => s.sudokuTheme);
  const theme = getSudokuTheme(sudokuThemeId);

  return (
    <SudokuThemeProvider theme={theme}>
      <SudokuStandaloneInner />
    </SudokuThemeProvider>
  );
};

export default SudokuStandalone;
