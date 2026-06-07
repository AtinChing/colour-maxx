import { type TileState } from '@/lib/game-logic';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  keyboardState: Map<string, TileState>;
}

export default function Keyboard({ onKeyPress, keyboardState }: KeyboardProps) {
  const getKeyColor = (key: string): string => {
    const state = keyboardState.get(key);
    switch (state) {
      case 'green':
        return 'bg-[#6aaa64] text-white border-[#6aaa64]';
      case 'yellow':
        return 'bg-[#c9b458] text-white border-[#c9b458]';
      case 'grey':
        return 'bg-[#787c7e] text-white border-[#787c7e]';
      default:
        return 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600';
    }
  };

  return (
    <div className="flex flex-col gap-[6px] items-center px-2">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-[6px] w-full justify-center">
          {row.map((key) => {
            const isSpecial = key === 'ENTER' || key === 'BACKSPACE';
            const keyLabel = key === 'BACKSPACE' ? '⌫' : key;

            return (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`
                  ${isSpecial ? 'px-3 text-xs' : 'w-[43px]'}
                  h-[58px] rounded font-bold uppercase transition-colors
                  border-2 active:scale-95 transform transition-transform
                  ${getKeyColor(key)}
                `}
              >
                {keyLabel}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
