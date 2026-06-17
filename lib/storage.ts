import { type Tile, type TileState } from './game-logic';

const GAME_STORAGE_PREFIX = 'colour-maxx:game';
const STATS_STORAGE_KEY = 'colour-maxx:stats';
const ACTIVE_SESSION_STORAGE_KEY = 'colour-maxx:active-session';
const STORAGE_VERSION = 1;

export type PersistedGameState = 'playing' | 'won' | 'lost';
export type GameMode = 'daily' | 'archive' | 'practice';

export interface GameSession {
  mode: GameMode;
  gameId: string;
  label: string;
  dailyKey: number;
}

export interface PersistedGame {
  version: number;
  gameId: string;
  mode: GameMode;
  label: string;
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

export function getDateInputValue(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDateFromDailyKey(dailyKey: number): Date {
  return new Date(dailyKey * 86400000);
}

export function createDailySession(date: Date = new Date()): GameSession {
  const dailyKey = getDailyKey(date);

  return {
    mode: 'daily',
    gameId: `daily:${dailyKey}`,
    label: 'Daily',
    dailyKey,
  };
}

export function createArchiveSession(dateValue: string): GameSession {
  const date = parseDateInputValue(dateValue);
  const dailyKey = getDailyKey(date);

  return {
    mode: 'archive',
    gameId: `archive:${dailyKey}`,
    label: getDateLabel(date),
    dailyKey,
  };
}

export function createPracticeSession(date: Date = new Date()): GameSession {
  const dailyKey = getDailyKey(date);
  const token = `${dailyKey}-${date.getTime()}`;

  return {
    mode: 'practice',
    gameId: `practice:${token}`,
    label: 'Practice',
    dailyKey,
  };
}

export function getAnswerForSession(answerWords: string[], session: GameSession): string {
  if (session.mode === 'practice') {
    const index = hashString(session.gameId) % answerWords.length;
    return answerWords[index].toUpperCase();
  }

  return answerWords[session.dailyKey % answerWords.length].toUpperCase();
}

export function loadActiveSession(): GameSession | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<GameSession>;
    return isGameSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveActiveSession(session: GameSession): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function loadPersistedGame(session: GameSession): PersistedGame | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(getGameStorageKey(session.gameId));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedGame>;
    return isPersistedGame(parsed, session) ? parsed : null;
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

  window.localStorage.setItem(getGameStorageKey(game.gameId), JSON.stringify(payload));
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

function getGameStorageKey(gameId: string): string {
  return `${GAME_STORAGE_PREFIX}:${gameId}`;
}

function isPersistedGame(value: Partial<PersistedGame>, session: GameSession): value is PersistedGame {
  return (
    value.version === STORAGE_VERSION &&
    value.gameId === session.gameId &&
    value.mode === session.mode &&
    typeof value.label === 'string' &&
    value.dailyKey === session.dailyKey &&
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

function isGameMode(value: unknown): value is GameMode {
  return value === 'daily' || value === 'archive' || value === 'practice';
}

function isGameSession(value: Partial<GameSession>): value is GameSession {
  return (
    isGameMode(value.mode) &&
    typeof value.gameId === 'string' &&
    typeof value.label === 'string' &&
    typeof value.dailyKey === 'number'
  );
}

function parseDateInputValue(dateValue: string): Date {
  const [year, month, day] = dateValue.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function hashString(value: string): number {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return hash;
}
