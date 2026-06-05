import { useState, useCallback } from 'react';
import type { Difficulty } from '../types';
import { DIFFICULTY_LABELS } from '../types';

const STORAGE_KEY = 'sudoku-statistics';

export interface DifficultyStats {
  bestTime: number | null; // seconds
  gamesCompleted: number;
  avgTime: number | null; // seconds
  totalTime: number;
}

export type Statistics = Record<Difficulty, DifficultyStats>;

function loadStats(): Statistics {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    easy: { bestTime: null, gamesCompleted: 0, avgTime: null, totalTime: 0 },
    medium: { bestTime: null, gamesCompleted: 0, avgTime: null, totalTime: 0 },
    hard: { bestTime: null, gamesCompleted: 0, avgTime: null, totalTime: 0 },
  };
}

function saveStats(stats: Statistics) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function useStatistics() {
  const [stats, setStats] = useState<Statistics>(loadStats);

  const recordCompletion = useCallback((difficulty: Difficulty, elapsedSeconds: number) => {
    setStats((prev) => {
      const ds = { ...prev[difficulty] };
      ds.gamesCompleted += 1;
      ds.totalTime += elapsedSeconds;
      ds.avgTime = ds.totalTime / ds.gamesCompleted;
      if (ds.bestTime === null || elapsedSeconds < ds.bestTime) {
        ds.bestTime = elapsedSeconds;
      }
      const next = { ...prev, [difficulty]: ds };
      saveStats(next);
      return next;
    });
  }, []);

  const formattedBestTime = useCallback(
    (difficulty: Difficulty): string => {
      const t = stats[difficulty].bestTime;
      if (t === null) return '--:--';
      const mins = Math.floor(t / 60);
      const secs = Math.floor(t % 60);
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },
    [stats],
  );

  return {
    stats,
    recordCompletion,
    formattedBestTime,
    DIFFICULTY_LABELS,
  };
}
