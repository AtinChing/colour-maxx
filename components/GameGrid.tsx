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
    <div className="grid gap-[5px] p-2" role="grid" aria-label="Guess board">
      {/* Completed guesses */}
      {guesses.map((guess, rowIndex) => (
        <div
          key={rowIndex}
          role="row"
          aria-label={`Guess ${rowIndex + 1}`}
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
        <div
          role="row"
          aria-label={`Current guess, ${currentGuess.length} of ${WORD_LENGTH} letters`}
          className={`grid grid-cols-5 gap-[5px] ${shake ? 'animate-shake' : ''}`}
        >
          {currentGuess.split('').map((letter, i) => (
            <div
              key={i}
              role="gridcell"
              aria-label={`Position ${i + 1}, letter ${letter}`}
              className="w-[62px] h-[62px] border-2 border-gray-500 dark:border-gray-500 flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase animate-pop"
            >
              {letter}
            </div>
          ))}
          {Array.from({ length: WORD_LENGTH - currentGuess.length }).map((_, i) => (
            <div
              key={currentGuess.length + i}
              role="gridcell"
              aria-label={`Position ${currentGuess.length + i + 1}, empty`}
              className="w-[62px] h-[62px] border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center"
            />
          ))}
        </div>
      )}

      {/* Empty rows */}
      {Array.from({ length: emptyRows }).map((_, rowIndex) => (
        <div
          key={`empty-${rowIndex}`}
          role="row"
          aria-label={`Empty guess row ${guesses.length + (currentGuess ? 2 : 1) + rowIndex}`}
          className="grid grid-cols-5 gap-[5px]"
        >
          {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => (
            <div
              key={colIndex}
              role="gridcell"
              aria-label={`Position ${colIndex + 1}, empty`}
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
  const stateLabel = getStateLabel(tile.state);

  return (
    <div
      role="gridcell"
      aria-label={`${tile.letter}, ${tile.state}${tile.scored ? ', scored' : ', not scored'}`}
      className={`w-[62px] h-[62px] border-2 flex items-center justify-center text-2xl font-bold uppercase text-white relative ${
        isRevealing ? 'tile-flip' : getBackgroundColor()
      }`}
      style={isRevealing ? revealStyle : undefined}
    >
      {tile.letter}
      <span
        aria-hidden="true"
        className="absolute bottom-0.5 right-1 text-[10px] font-black leading-none opacity-90"
      >
        {stateLabel}
      </span>
      {/* Score indicator for scored tiles */}
      {tile.scored && !isRevealing && (
        <div aria-hidden="true" className="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-gray-200 rounded-full animate-ping-once" />
      )}
    </div>
  );
}

function getStateLabel(state: Tile['state']): string {
  switch (state) {
    case 'green':
      return 'G';
    case 'yellow':
      return 'Y';
    case 'grey':
      return 'X';
    default:
      return '';
  }
}
