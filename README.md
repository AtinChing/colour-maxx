# Colour Maxx Edition

A Wordle spinoff game where you maximize colour score across 6 guesses while avoiding the answer.

## Game Rules

- You have 6 guesses to score as much colour as possible
- Green tiles (correct letter, correct position) = 2 points
- Yellow tiles (correct letter, wrong position) = 1 point
- Grey tiles = 0 points

**The Twist:** If you guess the exact answer, you lose immediately! The answer is a trap to avoid.

### Anti-Spam Scoring Rules

- No repeat words allowed in the same game
- Each green scores only once per (letter, position) pair
- Each yellow scores only once per (letter, position) pair
- Same letter can score as yellow in different positions

Your goal: maximize colour points while never assembling the complete answer.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with Wordle-inspired colour palette
- **No external dependencies** - Self-contained, runs entirely client-side

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation & Running

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

Or export as static site:
```bash
npm run build
npm run export
```

## Project Structure

```
colour-maxx/
├── app/
│   ├── page.tsx           # Main game component
│   ├── layout.tsx         # App layout
│   └── globals.css        # Global styles with animations
├── components/
│   ├── GameGrid.tsx       # 6x5 tile grid with flip animations
│   ├── Keyboard.tsx       # On-screen QWERTY keyboard
│   ├── EndModal.tsx       # Game over modal with stats
│   └── Toast.tsx          # Toast notifications
└── lib/
    ├── game-logic.ts      # Core game logic and scoring engine
    └── wordlists.ts       # Guessable words and answers lists
```

## Key Features Implemented

✅ **Core Gameplay**
- 6 guesses to maximize colour score
- Loss condition when answer is guessed
- Standard Wordle colouring rules with duplicate letter handling
- Once-per-pair scoring for greens and yellows
- No repeat words validation

✅ **Visual Design**
- Wordle-inspired aesthetic with exact colour palette
- Tile flip animations on guess submission
- Shake animation for invalid guesses
- Pop animation for letter input
- Score indicators on newly-scored tiles
- Dark mode support (follows system preference)

✅ **Scoring System**
- Real-time score tracking with animated updates
- PAR computation (theoretical maximum harvestable colour)
- Percent of PAR displayed
- Honest, non-fabricated metrics

✅ **Share Functionality**
- Wordle-style emoji grid (🟩🟨⬛)
- Copy to clipboard with date and score
- No spoilers in shared text

✅ **Daily Answer**
- Deterministic daily word selection
- Same answer for all players on same date
- Seeded from epoch days

✅ **User Experience**
- Physical keyboard support
- On-screen keyboard with state colours
- Toast notifications for errors
- Turn counter
- Mobile-first responsive design

## Customization

### Word Lists

The game uses official Wordle word lists:
- `GUESSABLE_WORDS` - 12,972 valid guesses (complete)
- `ANSWER_WORDS` - 2,315 possible daily answers (complete)

Lists are loaded from:
- `lib/words-guessable.ts` - Full dictionary
- `lib/words-answers.ts` - Curated answers

### Adjusting Game Constants

In `app/page.tsx`:
- `MAX_GUESSES` - Number of allowed guesses (default: 6)
- `WORD_LENGTH` - Letters per word (default: 5)

### Modifying PAR Calculation

The PAR computation is in `lib/game-logic.ts` in the `computePar()` function. The current implementation provides an upper-bound ceiling. See inline comments for details on the algorithm and future optimization opportunities.

## What Was Explicitly Deferred

The following features are intentionally omitted from v1 but designed to be easy additions:

1. **True Optimum Solver** - Current PAR is an upper bound, not the actual maximum achievable in 6 no-repeat guesses. A proper solver would require combinatorial optimization.

2. **Global Percentile/Leaderboard** - No fake distribution data. Real comparison requires a backend to collect scores.

3. **Streak Persistence** - No localStorage or session tracking yet. Game state resets on page reload. Hooks are commented in code for future implementation.

4. **Full Official Word Lists** - Using representative subset. Replace with complete Wordle word lists (commented in `wordlists.ts`).

## Code Quality Notes

- **Inline Unit Tests** - See `lib/game-logic.ts` for test assertions covering Wordle colouring, duplicate letters, and once-per-pair scoring
- **No Fake Data** - All metrics computed honestly; no fabricated percentiles
- **Clean Modularity** - Scoring engine isolated in game-logic module
- **Documented Par Definition** - See comments in `computePar()` function

## License

MIT - Feel free to use, modify, and distribute.

## Credits

Inspired by Wordle (Josh Wardle) and the "Don't Wordle" concept.
