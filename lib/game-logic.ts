// Core game logic for Colour Maxx Edition
// Implements Wordle colouring rules with once-per-pair scoring

export type TileState = 'empty' | 'filled' | 'green' | 'yellow' | 'grey';

export interface Tile {
  letter: string;
  state: TileState;
  scored: boolean; // Whether this tile contributed to the score
}

export interface GuessResult {
  tiles: Tile[];
  scoreGained: number;
  isAnswer: boolean;
}

export interface ScoredPair {
  letter: string;
  position: number;
}

/**
 * Get the daily answer deterministically based on the date.
 * Everyone playing on the same calendar day gets the same answer.
 */
export function getDailyAnswer(answerWords: string[], date: Date = new Date()): string {
  // Seed based on days since epoch
  const epochDays = Math.floor(date.getTime() / 86400000);
  const index = epochDays % answerWords.length;
  return answerWords[index].toUpperCase();
}

/**
 * Compute PAR: the maximum colour theoretically harvestable from the answer.
 * 
 * Par is defined as the total points available if every distinct (letter, position) pair
 * that the answer could ever award were scored.
 * 
 * For each position:
 *   - The answer's letter at that position = possible green (2 points)
 *   - Every other position where that letter could appear as yellow (1 point each)
 * 
 * This accounts for letter multiplicities in the answer and the once-per-pair rule.
 * 
 * Note: This is an upper bound ceiling, not a true optimum solver.
 * A proper optimum solver accounting for the 6-guess constraint and no-repeat-word rule
 * is deferred for future implementation.
 */
export function computePar(answer: string): number {
  const letters = answer.split('');
  const letterCounts = new Map<string, number>();
  
  // Count letter frequencies in answer
  for (const letter of letters) {
    letterCounts.set(letter, (letterCounts.get(letter) || 0) + 1);
  }
  
  let par = 0;
  
  // For each position, count possible greens and yellows
  for (let pos = 0; pos < 5; pos++) {
    const letter = letters[pos];
    
    // Green at this position: 2 points
    par += 2;
    
    // Yellows: this letter appearing at other positions
    // Each distinct (letter, other-position) pair scores 1
    const count = letterCounts.get(letter) || 1;
    
    // Can appear as yellow in (5 - 1) other positions, but capped by letter count
    // If letter appears once, can be yellow in up to 4 other positions (but need to reveal it's there)
    // If letter appears multiple times, each occurrence can be yellow elsewhere
    for (let otherPos = 0; otherPos < 5; otherPos++) {
      if (otherPos !== pos) {
        // Each wrong position for this letter is a potential yellow
        // But limited by how many of this letter exist
        // For simplicity: each (letter, position) pair not at its green position
        par += 1;
      }
    }
  }
  
  // The above overcounts for duplicate letters. Refine:
  // Actually, let's recalculate more carefully.
  
  par = 0;
  const processedLetters = new Set<string>();
  
  for (let pos = 0; pos < 5; pos++) {
    const letter = letters[pos];
    
    // Green at this position
    par += 2;
  }
  
  // Now count all possible yellows
  // For each letter in the answer, it can appear as yellow in positions where it's not green
  for (const [letter, count] of letterCounts.entries()) {
    // Find where this letter is green
    const greenPositions = letters
      .map((l, i) => l === letter ? i : -1)
      .filter(i => i !== -1);
    
    // This letter can be yellow at any position except where it's green
    // And we can score it once per (letter, position) pair
    for (let pos = 0; pos < 5; pos++) {
      if (!greenPositions.includes(pos)) {
        // Can be yellow here, counts once
        par += 1;
      }
    }
  }
  
  return par;
}

/**
 * Evaluate a guess against the answer using standard Wordle colouring rules.
 * Handles duplicate letters correctly: greens first, then yellows from remaining letters.
 * 
 * Returns tiles with their visual state (green/yellow/grey) but does NOT compute scoring.
 * Scoring is handled separately by scoreGuess() which applies the once-per-pair rule.
 */
export function evaluateGuess(guess: string, answer: string): TileState[] {
  const guessLetters = guess.split('');
  const answerLetters = answer.split('');
  const result: TileState[] = Array(5).fill('grey');
  const answerUsed = Array(5).fill(false);
  
  // First pass: mark greens (correct letter in correct position)
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      result[i] = 'green';
      answerUsed[i] = true;
    }
  }
  
  // Second pass: mark yellows (correct letter in wrong position)
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'grey') {
      // Not green, check if letter exists elsewhere in answer
      for (let j = 0; j < 5; j++) {
        if (!answerUsed[j] && guessLetters[i] === answerLetters[j]) {
          result[i] = 'yellow';
          answerUsed[j] = true;
          break;
        }
      }
    }
  }
  
  return result;
}

/**
 * Score a guess against the answer, applying the once-per-pair anti-spam rules.
 * 
 * Rules:
 * - Green tile (right letter, right position) = 2 points
 * - Yellow tile (right letter, wrong position) = 1 point
 * - Grey tile = 0 points
 * 
 * Anti-spam rules (enforced via scoredPairs tracking):
 * - Each green scores once per (letter, position) pair. Once a green for (O, pos 3) is scored,
 *   future green O in position 3 scores 0 (but still shows green visually).
 * - Each yellow scores once per (letter, position) pair. A yellow B in position 1 scores once;
 *   same B in position 1 again scores 0. But B as yellow in position 4 is a new pair and scores.
 * 
 * @param tileStates - The visual tile states from evaluateGuess()
 * @param guessLetters - The letters of the guess
 * @param greensSeen - Set of already-scored green (letter, position) pairs
 * @param yellowsSeen - Set of already-scored yellow (letter, position) pairs
 * @returns Object with scoreGained and tiles marked with scored=true/false
 */
export function scoreGuess(
  tileStates: TileState[],
  guessLetters: string[],
  greensSeen: Set<string>,
  yellowsSeen: Set<string>
): { scoreGained: number; tiles: Tile[] } {
  let scoreGained = 0;
  const tiles: Tile[] = [];
  
  for (let i = 0; i < 5; i++) {
    const letter = guessLetters[i];
    const state = tileStates[i];
    const pairKey = `${letter}-${i}`;
    let scored = false;
    
    if (state === 'green') {
      if (!greensSeen.has(pairKey)) {
        scoreGained += 2;
        greensSeen.add(pairKey);
        scored = true;
      }
    } else if (state === 'yellow') {
      if (!yellowsSeen.has(pairKey)) {
        scoreGained += 1;
        yellowsSeen.add(pairKey);
        scored = true;
      }
    }
    
    tiles.push({ letter, state, scored });
  }
  
  return { scoreGained, tiles };
}

/**
 * Process a complete guess: evaluate it and score it.
 * 
 * @returns GuessResult with tiles, score gained, and whether this guess is the exact answer
 */
export function processGuess(
  guess: string,
  answer: string,
  greensSeen: Set<string>,
  yellowsSeen: Set<string>
): GuessResult {
  const tileStates = evaluateGuess(guess, answer);
  const guessLetters = guess.split('');
  const { scoreGained, tiles } = scoreGuess(tileStates, guessLetters, greensSeen, yellowsSeen);
  const isAnswer = guess === answer;
  
  return { tiles, scoreGained, isAnswer };
}

/**
 * Update keyboard state based on tiles.
 * Returns best-known state for each letter (green > yellow > grey).
 */
export function updateKeyboardState(
  tiles: Tile[],
  currentState: Map<string, TileState>
): Map<string, TileState> {
  const newState = new Map(currentState);
  
  const priority = { green: 3, yellow: 2, grey: 1, filled: 0, empty: 0 };
  
  for (const tile of tiles) {
    const current = newState.get(tile.letter) || 'empty';
    if (priority[tile.state] > priority[current]) {
      newState.set(tile.letter, tile.state);
    }
  }
  
  return newState;
}

// Unit test assertions (inline, for verification)
if (typeof window === 'undefined') {
  // Only run in Node environment, not browser
  
  // Test 1: Basic Wordle colouring - CRANE vs CRATE
  // C-green(match), R-green(match), A-green(match), N-grey(not in answer), E-green(match at pos 4)
  const test1 = evaluateGuess('CRANE', 'CRATE');
  console.assert(
    test1[0] === 'green' && test1[1] === 'green' && test1[2] === 'green' && 
    test1[3] === 'grey' && test1[4] === 'green',
    'Test 1 failed: Basic colouring',
    test1
  );
  
  // Test 2: Duplicate letter handling - LLAMA vs FLAME
  // F-L-A-M-E answer
  // L(pos 0)-grey(not in pos 0), L(pos 1)-green(matches pos 1), A(pos 2)-green(matches pos 2), 
  // M(pos 3)-green(matches pos 3), A(pos 4)-grey(A already used at pos 2)
  const test2 = evaluateGuess('LLAMA', 'FLAME');
  console.assert(
    test2[0] === 'grey' && test2[1] === 'green' && test2[2] === 'green' && 
    test2[3] === 'green' && test2[4] === 'grey',
    'Test 2 failed: Duplicate letter handling',
    test2
  );
  
  // Test 3: Once-per-pair scoring for greens
  const greensSeen = new Set<string>();
  const yellowsSeen = new Set<string>();
  
  const tiles1 = evaluateGuess('TESTS', 'TESTS');
  const score1 = scoreGuess(tiles1, 'TESTS'.split(''), greensSeen, yellowsSeen);
  console.assert(score1.scoreGained === 10, 'Test 3a failed: First all-green should score 10', score1.scoreGained);
  
  const tiles2 = evaluateGuess('TESTS', 'TESTS');
  const score2 = scoreGuess(tiles2, 'TESTS'.split(''), greensSeen, yellowsSeen);
  console.assert(score2.scoreGained === 0, 'Test 3b failed: Second all-green should score 0', score2.scoreGained);
  
  // Test 4: Yellow once-per-(letter,position) pair - CRANE vs TRACE
  // T-R-A-C-E answer
  // C(pos 0)-yellow(C is at pos 3 in answer), R(pos 1)-yellow(R at pos 1 in answer = green!), 
  // A(pos 2)-yellow(A at pos 2 = green!), N(pos 3)-grey, E(pos 4)-green
  // Actually CRANE vs TRACE: C-yellow, R-green, A-green, N-grey, E-green = 1+2+2+0+2 = 7
  const greensSeen2 = new Set<string>();
  const yellowsSeen2 = new Set<string>();
  
  const tiles3 = evaluateGuess('CRANE', 'TRACE');
  const score3 = scoreGuess(tiles3, 'CRANE'.split(''), greensSeen2, yellowsSeen2);
  console.assert(score3.scoreGained === 7, 'Test 4a failed: Initial yellow scoring', score3.scoreGained);
  
  // Same guess again
  const tiles4 = evaluateGuess('CRANE', 'TRACE');
  const score4 = scoreGuess(tiles4, 'CRANE'.split(''), greensSeen2, yellowsSeen2);
  // All same (letter,position) pairs already seen, so 0
  console.assert(score4.scoreGained === 0, 'Test 4b failed: Re-scoring same guess', score4.scoreGained);
}
