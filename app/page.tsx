'use client';

import { useState, useEffect, useCallback } from 'react';
import { GUESSABLE_WORDS, ANSWER_WORDS } from '@/lib/wordlists';
import {
  getDailyAnswer,
  computePar,
  processGuess,
  updateKeyboardState,
  type Tile,
  type TileState,
} from '@/lib/game-logic';
import GameGrid from '@/components/GameGrid';
import Keyboard from '@/components/Keyboard';
import EndModal from '@/components/EndModal';
import RulesModal from '@/components/RulesModal';
import Toast from '@/components/Toast';

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

type GameState = 'playing' | 'won' | 'lost';

export default function Home() {
  const [answer, setAnswer] = useState('');
  const [par, setPar] = useState(0);
  const [guesses, setGuesses] = useState<Tile[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [score, setScore] = useState(0);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [greensSeen, setGreensSeen] = useState<Set<string>>(new Set());
  const [yellowsSeen, setYellowsSeen] = useState<Set<string>>(new Set());
  const [keyboardState, setKeyboardState] = useState<Map<string, TileState>>(new Map());
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);
  const [shake, setShake] = useState(false);
  const [revealingRow, setRevealingRow] = useState(-1);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);

  // Initialize game
  useEffect(() => {
    const dailyAnswer = getDailyAnswer(ANSWER_WORDS);
    const dailyPar = computePar(dailyAnswer);
    setAnswer(dailyAnswer);
    setPar(dailyPar);
  }, []);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToast({ message, id });
    setTimeout(() => setToast(null), 2000);
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (gameState !== 'playing' || revealingRow !== -1) return;

    if (key === 'ENTER') {
      if (currentGuess.length !== WORD_LENGTH) {
        showToast('Not enough letters');
        triggerShake();
        return;
      }

      const upperGuess = currentGuess.toUpperCase();

      // Check if word is in guessable list
      if (!GUESSABLE_WORDS.has(currentGuess.toLowerCase())) {
        showToast('Not in word list');
        triggerShake();
        return;
      }

      // Check if word already used
      if (usedWords.has(upperGuess)) {
        showToast('Already used');
        triggerShake();
        return;
      }

      // Process the guess
      const result = processGuess(upperGuess, answer, new Set(greensSeen), new Set(yellowsSeen));
      
      // Add to used words
      setUsedWords(prev => new Set([...prev, upperGuess]));
      
      // Update greens and yellows seen
      result.tiles.forEach((tile, i) => {
        const pairKey = `${tile.letter}-${i}`;
        if (tile.state === 'green' && tile.scored) {
          setGreensSeen(prev => new Set([...prev, pairKey]));
        } else if (tile.state === 'yellow' && tile.scored) {
          setYellowsSeen(prev => new Set([...prev, pairKey]));
        }
      });
      
      // Update keyboard state
      setKeyboardState(prev => updateKeyboardState(result.tiles, prev));
      
      // Animate the reveal
      setRevealingRow(guesses.length);
      setGuesses(prev => [...prev, result.tiles]);
      setCurrentGuess('');
      
      // Wait for tile flip animation
      setTimeout(() => {
        setRevealingRow(-1);
        
        // Update score with animation
        if (result.scoreGained > 0) {
          setScore(prev => prev + result.scoreGained);
        }
        
        // Check if hit the answer (loss condition)
        if (result.isAnswer) {
          setTimeout(() => {
            setGameState('lost');
          }, 500);
          return;
        }
        
        // Check if game over (used all guesses)
        if (guesses.length + 1 >= MAX_GUESSES) {
          setTimeout(() => {
            setGameState('won'); // "won" here means finished without hitting answer
          }, 500);
        }
      }, 2000); // Time for all tiles to flip
      
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < WORD_LENGTH && /^[A-Z]$/i.test(key)) {
      setCurrentGuess(prev => prev + key.toUpperCase());
    }
  }, [
    currentGuess,
    gameState,
    answer,
    usedWords,
    greensSeen,
    yellowsSeen,
    guesses.length,
    revealingRow,
    showToast,
    triggerShake
  ]);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        handleKeyPress('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const turnsRemaining = MAX_GUESSES - guesses.length;
  const percent = par > 0 ? Math.round((score / par) * 100) : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-[#121213] flex flex-col items-center justify-between py-4 px-2 transition-colors">
      {/* Header */}
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setRulesModalOpen(true)}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 p-2"
            aria-label="How to play"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-wide">
              COLOUR MAXX EDITION
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Grab as much colour as you can in 6 guesses, but never type the answer.
            </p>
          </div>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </div>

        {/* Stats bar */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Colour: <span className="text-green-600 dark:text-green-500">{score}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {turnsRemaining} {turnsRemaining === 1 ? 'turn' : 'turns'} left
          </div>
        </div>
      </div>

      {/* Game grid */}
      <div className="flex-1 flex items-center justify-center w-full">
        <GameGrid
          guesses={guesses}
          currentGuess={currentGuess}
          maxGuesses={MAX_GUESSES}
          shake={shake}
          revealingRow={revealingRow}
        />
      </div>

      {/* Keyboard */}
      <div className="w-full max-w-lg">
        <Keyboard onKeyPress={handleKeyPress} keyboardState={keyboardState} />
      </div>

      {/* Toast notifications */}
      {toast && <Toast message={toast.message} />}

      {/* End modal */}
      {gameState !== 'playing' && (
        <EndModal
          gameState={gameState}
          score={score}
          par={par}
          percent={percent}
          answer={answer}
          guesses={guesses}
        />
      )}

      {/* Rules modal */}
      <RulesModal
        isOpen={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
      />
    </div>
  );
}
