import { type Tile } from '@/lib/game-logic';
import { type GameSession, type LocalStats } from '@/lib/storage';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { useRef, useState } from 'react';

interface EndModalProps {
  gameState: 'won' | 'lost';
  score: number;
  par: number;
  percent: number;
  answer: string;
  guesses: Tile[][];
  stats: LocalStats;
  session: GameSession | null;
  onNewPractice: () => void;
}

export default function EndModal({
  gameState,
  score,
  par,
  percent,
  answer,
  guesses,
  stats,
  session,
  onNewPractice,
}: EndModalProps) {
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);

  const generateShareText = () => {
    const label = session?.mode === 'practice'
      ? 'Practice'
      : session?.label ?? 'Daily';

    let text = `Colour Maxx Edition - ${label}\n`;
    text += `Colour: ${score}/${par} (${percent}%)\n\n`;

    // Generate emoji grid
    guesses.forEach((guess) => {
      const row = guess
        .map((tile) => {
          switch (tile.state) {
            case 'green':
              return '🟩';
            case 'yellow':
              return '🟨';
            case 'grey':
              return '⬛';
            default:
              return '⬜';
          }
        })
        .join('');
      text += row + '\n';
    });

    return text;
  };

  const handleCopyResults = () => {
    const shareText = generateShareText();
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isLoss = gameState === 'lost';
  const isDaily = session?.mode === 'daily';
  const averageScore = stats.gamesPlayed > 0
    ? Math.round(stats.totalScore / stats.gamesPlayed)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
        tabIndex={-1}
        className="bg-white dark:bg-[#121213] rounded-lg p-6 max-w-sm w-full shadow-2xl border-2 border-gray-300 dark:border-gray-700"
      >
        {/* Header */}
        <div className="text-center mb-4">
          {isLoss ? (
            <>
              <h2 id="result-title" className="text-2xl font-bold text-red-600 dark:text-red-500 mb-2">
                You typed the answer.
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Game over.</p>
            </>
          ) : (
            <>
              <h2 id="result-title" className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Game Complete
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You avoided the answer!
              </p>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="border-t border-b border-gray-300 dark:border-gray-700 py-4 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-500">
                {score}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Colour
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{par}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Par
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-500">
                {percent}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Of Par
              </div>
            </div>
          </div>
        </div>

        {/* Answer reveal */}
        <div className="text-center mb-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">The answer was</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-wider">
            {answer}
          </p>
        </div>

        {/* Local stats */}
        {isDaily && (
          <div className="border-b border-gray-300 dark:border-gray-700 pb-4 mb-4">
            <div className="grid grid-cols-5 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.gamesPlayed}
                </div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Played
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.gamesWon}
                </div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Avoided
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.currentStreak}
                </div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Streak
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.bestStreak}
                </div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Best
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {averageScore}
                </div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Avg
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid recap */}
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-900 rounded">
          <div className="flex flex-col gap-1 font-mono text-2xl">
            {guesses.map((guess, i) => (
              <div key={i} className="flex gap-1 justify-center">
                {guess.map((tile, j) => {
                  switch (tile.state) {
                    case 'green':
                      return <span key={j}>🟩</span>;
                    case 'yellow':
                      return <span key={j}>🟨</span>;
                    case 'grey':
                      return <span key={j}>⬛</span>;
                    default:
                      return <span key={j}>⬜</span>;
                  }
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopyResults}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors"
        >
          {copied ? 'Copied!' : 'Copy Results'}
        </button>

        {/* Next game button */}
        <button
          onClick={onNewPractice}
          className="w-full mt-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-bold py-3 px-4 rounded transition-colors"
        >
          New Practice
        </button>
      </div>
    </div>
  );
}
