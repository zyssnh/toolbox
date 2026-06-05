import type { Board, Difficulty, FixedBoard } from './types';
import { SIZE, BOX_SIZE, DIFFICULTY_REMOVE } from './types';

export function createEmptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function createEmptyPencilMarks(): (Set<number> | null)[][] {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

export function clonePencilMarks(pm: (Set<number> | null)[][]): (Set<number> | null)[][] {
  return pm.map((row) => row.map((cell) => (cell ? new Set(cell) : null)));
}

export function isValidPlacement(board: Board, row: number, col: number, num: number): boolean {
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

export function solveHelper(board: Board): boolean {
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

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generatePuzzle(difficulty: Difficulty): {
  puzzle: Board;
  solution: Board;
  fixedCells: FixedBoard;
} {
  const board = createEmptyBoard();
  solveHelper(board);

  const solution = cloneBoard(board);
  const puzzle = cloneBoard(board);
  const removeCount = DIFFICULTY_REMOVE[difficulty];

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

    const testBoard = cloneBoard(puzzle);
    if (solveHelper(testBoard)) {
      let solutions = 0;
      const testUniq = cloneBoard(puzzle);
      countSolutions(
        testUniq,
        () => {
          solutions++;
        },
        () => solutions >= 2,
      );
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

export function countSolutions(
  board: Board,
  onSolution: () => void,
  shouldStop: () => boolean,
): void {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(board, r, c, num)) {
            board[r][c] = num;
            countSolutions(board, onSolution, shouldStop);
            if (shouldStop()) return;
            board[r][c] = 0;
          }
        }
        return;
      }
    }
  }
  onSolution();
}

export function hasConflicts(board: Board, row: number, col: number, num: number): boolean {
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

export function isBoardComplete(board: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return false;
    }
  }
  return true;
}

export function isBoardValid(board: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const num = board[r][c];
      if (num === 0) continue;
      if (hasConflicts(board, r, c, num)) return false;
    }
  }
  return true;
}

/** Get all valid candidate numbers for a specific cell */
export function getCandidates(board: Board, row: number, col: number): number[] {
  if (board[row][col] !== 0) return [];
  const candidates: number[] = [];
  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(board, row, col, num)) {
      candidates.push(num);
    }
  }
  return candidates;
}

/** Find the next empty cell that has the fewest candidates (best hint target) */
export function findHintCell(
  board: Board,
): { r: number; c: number; candidates: number[] } | null {
  let best: { r: number; c: number; candidates: number[] } | null = null;
  let bestCount = 10;

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) {
        const cands = getCandidates(board, r, c);
        if (cands.length > 0 && cands.length < bestCount) {
          best = { r, c, candidates: cands };
          bestCount = cands.length;
          if (bestCount === 1) return best; // only one candidate — perfect hint
        }
      }
    }
  }
  return best;
}

/** Find a cell where the solution value can be revealed (uses solution board) */
export function findHintFromSolution(
  puzzle: Board,
  solution: Board,
): { r: number; c: number; value: number } | null {
  // Prioritize cells with fewest candidates (hardest for the player)
  const hintCell = findHintCell(puzzle);
  if (hintCell && solution[hintCell.r][hintCell.c] !== 0) {
    return { r: hintCell.r, c: hintCell.c, value: solution[hintCell.r][hintCell.c] };
  }
  // Fallback: any empty cell
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (puzzle[r][c] === 0) {
        return { r, c, value: solution[r][c] };
      }
    }
  }
  return null;
}
