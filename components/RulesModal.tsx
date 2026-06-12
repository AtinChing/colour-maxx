'use client';

import { useState } from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#121213] rounded-lg p-6 max-w-md w-full shadow-2xl border-2 border-gray-300 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How to Play
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          {/* Goal */}
          <section>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
              🎯 The Goal
            </h3>
            <p>
              Maximize your <span className="font-bold">colour score</span> across 6 guesses while{' '}
              <span className="font-bold text-red-600 dark:text-red-400">never typing the answer</span>.
              Type the answer = instant game over!
            </p>
          </section>

          {/* Scoring */}
          <section>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
              💚 Scoring System
            </h3>
            <ul className="space-y-2 pl-5 list-disc">
              <li>
                <span className="text-[#6aaa64] font-bold">🟩 Green</span> = correct letter, correct position ={' '}
                <span className="font-bold">2 points</span>
              </li>
              <li>
                <span className="text-[#c9b458] font-bold">🟨 Yellow</span> = correct letter, wrong position ={' '}
                <span className="font-bold">1 point</span>
              </li>
              <li>
                <span className="text-[#787c7e] font-bold">⬛ Grey</span> = letter not in answer ={' '}
                <span className="font-bold">0 points</span>
              </li>
            </ul>
          </section>

          {/* Anti-spam Rules */}
          <section>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
              ⚡ Anti-Spam Rules
            </h3>
            <p className="mb-2">
              Each <span className="font-bold">(letter, position) pair</span> scores only once:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm">
              <p className="mb-1">
                • Get <span className="text-[#6aaa64]">🟩 Green O</span> in position 3 → scores 2
              </p>
              <p className="mb-1">
                • Get <span className="text-[#6aaa64]">🟩 Green O</span> in position 3 again → scores 0
              </p>
              <p>
                • Get <span className="text-[#6aaa64]">🟩 Green O</span> in position 4 → scores 2 (new position!)
              </p>
            </div>
          </section>

          {/* Strategy Tips */}
          <section>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
              🧠 Strategy Tips
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-2xl mr-3">1️⃣</span>
                <span>
                  <span className="font-bold">Early game:</span> Fish for letters (find yellows)
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">2️⃣</span>
                <span>
                  <span className="font-bold">Mid game:</span> Convert yellows to greens (move letters)
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">3️⃣</span>
                <span>
                  <span className="font-bold">Late game:</span> Score fresh pairs without solving
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">💣</span>
                <span>
                  <span className="font-bold">Warning:</span> High-scoring guesses risk solving the puzzle!
                </span>
              </div>
            </div>
          </section>

          {/* Daily Game */}
          <section className="pt-4 border-t border-gray-300 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
              📅 Daily Game
            </h3>
            <p>
              Everyone gets the same answer each day. Share your score grid after 6 guesses or when you hit the answer.
            </p>
          </section>
        </div>

        {/* Close button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded transition-colors"
          >
            Got it, let's play!
          </button>
        </div>
      </div>
    </div>
  );
}
