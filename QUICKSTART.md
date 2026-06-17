# Quick Start Guide

## Play the Game Right Now

1. **Install dependencies** (first time only):
   ```bash
   cd colour-maxx
   npm install
   ```

2. **Start the game**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Visit http://localhost:3000

That's it! The game is now running.

## How to Play

### Goal
Maximize your colour score across 6 guesses while avoiding the answer.

### Scoring
- 🟩 Green tile (correct letter, correct position) = **2 points**
- 🟨 Yellow tile (correct letter, wrong position) = **1 point**
- ⬛ Grey tile = **0 points**

### The Twist
**If you guess the exact answer, you lose immediately!** The answer is a trap to avoid.

### Rules
1. You have exactly 6 guesses
2. Each guess must be a valid 5-letter word
3. You cannot repeat the same word
4. Each (letter, position) pair scores only once:
   - If you get a green O in position 3, future green O's in position 3 score 0
   - If you get a yellow B in position 1, future yellow B's in position 1 score 0
   - But yellow B in position 4 would score (different position)

### Strategy Tips
- Early guesses: Fish for letters (find yellows)
- Middle guesses: Convert yellows to greens
- Late guesses: Maximize new pairs without completing the answer
- Never complete the answer!

### Controls
- **Type** on your keyboard (or use on-screen keyboard)
- **Enter** to submit a guess
- **Backspace** to delete a letter
- **Daily** to return to today's shared puzzle
- **New Practice** to start a fresh practice puzzle
- **Archive** with a date picker to replay a previous day

## Modes

- **Daily:** shared answer for everyone on the same date. Your board, score, and result resume after refresh.
- **Archive:** selected dates use the same deterministic answer every time and resume separately.
- **Practice:** starts a fresh seeded game whenever you want another round.

## Your Score

After 6 guesses (or hitting the answer), you'll see:
- Your total colour score
- PAR (theoretical maximum)
- Your percent of PAR

50-70% is good, 80%+ is excellent!

## Share Your Results

Click "Copy Results" to get a shareable emoji grid:

```
Colour Maxx Edition - Jun 6, 2026
Colour: 23/30 (76%)

🟩🟨⬜⬜🟨
⬜🟩🟩⬜⬜
🟨🟩🟩🟨⬜
🟩🟩🟩⬜⬜
🟩🟩🟩🟨🟨
🟩🟩🟩🟨⬜
```

## Building for Production

```bash
npm run build
npm start
```

See DEPLOYMENT.md for more deployment options (Vercel, Netlify, static export, etc.).

## Need Help?

- Check README.md for full documentation
- Check IMPLEMENTATION_NOTES.md for technical details
- Check DEPLOYMENT.md for hosting options

Enjoy the game!
