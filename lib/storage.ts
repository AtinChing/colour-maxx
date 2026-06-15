import { type Tile, type TileState } from './game-logic';

const GAME_STORAGE_PREFIX = 'colour-maxx:game';
const STATS_STORAGE_KEY = 'colour-maxx:stats';
const STORAGE_VERSION = 1;

export type PersistedGameState = 'playing' | 'won' | 'lost';

export interface PersistedGame {
  version: number;
  dailyKey: number;
  answer: string;
  par: number;
  guesses: Tile[][];
  currentGuess: string;
  gameState: PersistedGameState;
  score: number;
  usedWords: string[];
  greensSeen: string[];
  yellowsSeen: string[];
  keyboardState: [string, TileState][];
  savedAt: string;
}

export interface LocalStats {
  version: number;
  gamesPlayed: number;
  gamesWon: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
  totalScore: number;
  bestScore: number;
  lastRecordedDailyKey: number | null;
  lastResult: PersistedGameState | null;
}

export const EMPTY_STATS: LocalStats = {
  version: STORAGE_VERSION,
  gamesPlayed: 0,
  gamesWon: 0,
  losses: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalScore: 0,
  bestScore: 0,
  lastRecordedDailyKey: null,
  lastResult: null,
};

export function getDailyKey(date: Date = new Date()): number {
  return Math.floor(date.getTime() / 86400000);
}

export function loadPersistedGame(dailyKey: number): PersistedGame | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(getGameStorageKey(dailyKey));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedGame>;
    return isPersistedGame(parsed, dailyKey) ? parsed : null;
  } catch {
    return null;
  }
}

export function savePersistedGame(game: Omit<PersistedGame, 'version' | 'savedAt'>): void {
  if (typeof window === 'undefined') return;

  const payload: PersistedGame = {
    ...game,
    version: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(getGameStorageKey(game.dailyKey), JSON.stringify(payload));
}

export function loadLocalStats(): LocalStats {
  if (typeof window === 'undefined') return EMPTY_STATS;

  const raw = window.localStorage.getItem(STATS_STORAGE_KEY);
  if (!raw) return EMPTY_STATS;

  try {
    const parsed = JSON.parse(raw) as Partial<LocalStats>;
    return isLocalStats(parsed) ? parsed : EMPTY_STATS;
  } catch {
    return EMPTY_STATS;
  }
}

export function recordCompletedGame(
  stats: LocalStats,
  dailyKey: number,
  gameState: PersistedGameState,
  score: number
): LocalStats {
  if (stats.lastRecordedDailyKey === dailyKey) {
    return stats;
  }

  const won = gameState === 'won';
  const previousDayWasRecorded = stats.lastRecordedDailyKey === dailyKey - 1;
  const currentStreak = won
    ? previousDayWasRecorded
      ? stats.currentStreak + 1
      : 1
    : 0;

  const nextStats: LocalStats = {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + (won ? 1 : 0),
    losses: stats.losses + (gameState === 'lost' ? 1 : 0),
    currentStreak,
    bestStreak: Math.max(stats.bestStreak, currentStreak),
    totalScore: stats.totalScore + score,
    bestScore: Math.max(stats.bestScore, score),
    lastRecordedDailyKey: dailyKey,
    lastResult: gameState,
  };

  saveLocalStats(nextStats);
  return nextStats;
}

function saveLocalStats(stats: LocalStats): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
}

function getGameStorageKey(dailyKey: number): string {
  return `${GAME_STORAGE_PREFIX}:${dailyKey}`;
}

function isPersistedGame(value: Partial<PersistedGame>, dailyKey: number): value is PersistedGame {
  return (
    value.version === STORAGE_VERSION &&
    value.dailyKey === dailyKey &&
    typeof value.answer === 'string' &&
    typeof value.par === 'number' &&
    Array.isArray(value.guesses) &&
    typeof value.currentGuess === 'string' &&
    isGameState(value.gameState) &&
    typeof value.score === 'number' &&
    Array.isArray(value.usedWords) &&
    Array.isArray(value.greensSeen) &&
    Array.isArray(value.yellowsSeen) &&
    Array.isArray(value.keyboardState) &&
    typeof value.savedAt === 'string'
  );
}

function isLocalStats(value: Partial<LocalStats>): value is LocalStats {
  return (
    value.version === STORAGE_VERSION &&
    typeof value.gamesPlayed === 'number' &&
    typeof value.gamesWon === 'number' &&
    typeof value.losses === 'number' &&
    typeof value.currentStreak === 'number' &&
    typeof value.bestStreak === 'number' &&
    typeof value.totalScore === 'number' &&
    typeof value.bestScore === 'number' &&
    (typeof value.lastRecordedDailyKey === 'number' || value.lastRecordedDailyKey === null) &&
    (isGameState(value.lastResult) || value.lastResult === null)
  );
}

function isGameState(value: unknown): value is PersistedGameState {
  return value === 'playing' || value === 'won' || value === 'lost';
}
