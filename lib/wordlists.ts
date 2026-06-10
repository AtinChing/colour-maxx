// Official Wordle word lists
// Complete vocabulary system with 12,972+ guessable words and 2,315 answer words
// Sources: 
// - https://github.com/tabatkins/wordle-list (guessable)
// - https://github.com/Kinkelin/WordleCompetition (answers)

import { COMPLETE_GUESSABLE_WORDS } from './words-guessable';
import { COMPLETE_ANSWER_WORDS } from './words-answers';

// GUESSABLE_WORDS: Complete set of valid 5-letter words that can be guessed
export const GUESSABLE_WORDS = new Set(COMPLETE_GUESSABLE_WORDS);

// ANSWER_WORDS: Curated list of words that can appear as daily answers
export const ANSWER_WORDS = COMPLETE_ANSWER_WORDS;
