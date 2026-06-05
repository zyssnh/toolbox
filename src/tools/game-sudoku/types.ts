export type Difficulty = 'easy' | 'medium' | 'hard';

export type Board = number[][]; // 0 = empty
export type FixedBoard = boolean[][]; // true = given cell (immutable)
export type PencilMarks = (Set<number> | null)[][]; // null = no marks for that cell

export interface Move {
  r: number;
  c: number;
  prevValue: number;
  newValue: number;
  prevPencilMarks?: Set<number> | null;
  newPencilMarks?: Set<number> | null;
}

export const SIZE = 9;
export const BOX_SIZE = 3;

export const DIFFICULTY_REMOVE: Record<Difficulty, number> = {
  easy: 30,
  medium: 45,
  hard: 55,
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};
