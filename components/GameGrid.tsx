import { type Tile } from '@/lib/game-logic';
import { type CSSProperties } from 'react';

const WORD_LENGTH = 5;

interface GameGridProps {
  guesses: Tile[][];
  currentGuess: string;
  maxGuesses: number;
  shake: boolean;
  revealingRow: number;
}

export default function GameGrid({
  guesses,
  currentGuess,
  maxGuesses,
  shake,
  revealingRow,
}: GameGridProps) {
  const emptyRows = maxGuesses - guesses.length - (currentGuess ? 1 : 0);

  return (
    <div className="grid gap-[5px] p-2">
      {/* Completed guesses */}
      {guesses.map((guess, rowIndex) => (
        <div
          key={rowIndex}
          className={`grid grid-cols-5 gap-[5px] ${
            rowIndex === revealingRow ? 'revealing' : ''
          }`}
        >
          {guess.map((tile, colIndex) => (
            <TileComponent
              key={colIndex}
              tile={tile}
              isRevealing={rowIndex === revealingRow}
              revealDelay={colIndex * 300}
            />
          ))}
        </div>
      ))}

      {/* Current guess row */}
      {currentGuess && (
        <div className={`grid grid-cols-5 gap-[5px] ${shake ? 'animate-shake' : ''}`}>
          {currentGuess.split('').map((letter, i) => (
            <div
              key={i}
              className="w-[62px] h-[62px] border-2 border-gray-500 dark:border-gray-500 flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase animate-pop"
            >
              {letter}
            </div>
          ))}
          {Array.from({ length: WORD_LENGTH - currentGuess.length }).map((_, i) => (
            <div
              key={currentGuess.length + i}
              className="w-[62px] h-[62px] border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center"
            />
          ))}
        </div>
      )}

      {/* Empty rows */}
      {Array.from({ length: emptyRows }).map((_, rowIndex) => (
        <div key={`empty-${rowIndex}`} className="grid grid-cols-5 gap-[5px]">
          {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="w-[62px] h-[62px] border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function TileComponent({
  tile,
  isRevealing,
  revealDelay,
}: {
  tile: Tile;
  isRevealing: boolean;
  revealDelay: number;
}) {
  const getBackgroundColor = () => {
    switch (tile.state) {
      case 'green':
        return 'bg-[#6aaa64] border-[#6aaa64]';
      case 'yellow':
        return 'bg-[#c9b458] border-[#c9b458]';
      case 'grey':
        return 'bg-[#787c7e] border-[#787c7e]';
      default:
        return 'bg-white dark:bg-[#121213] border-gray-300 dark:border-gray-700';
    }
  };
  const revealStyle = {
    animationDelay: `${revealDelay}ms`,
    '--tile-bg': tile.state === 'green' ? '#6aaa64' : tile.state === 'yellow' ? '#c9b458' : '#787c7e',
  } as CSSProperties & Record<'--tile-bg', string>;

  return (
    <div
      className={`w-[62px] h-[62px] border-2 flex items-center justify-center text-2xl font-bold uppercase text-white relative ${
        isRevealing ? 'tile-flip' : getBackgroundColor()
      }`}
      style={isRevealing ? revealStyle : undefined}
    >
      {tile.letter}
      {/* Score indicator for scored tiles */}
      {tile.scored && !isRevealing && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-gray-200 rounded-full animate-ping-once" />
      )}
    </div>
  );
}
