/**
 * ScoreBoard Component
 * Displays the current score, time, and goal progress
 */
import React from 'react';

interface ScoreBoardProps {
  score: number;
  time: number;
}

/**
 * Displays game stats at the top of the game area
 */
export default function ScoreBoard({ score, time }: ScoreBoardProps) {
  return (
    <div className="bg-green-800 bg-opacity-80 backdrop-filter backdrop-blur-sm text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <span className="mr-2">⏱️</span>
        <span className="text-xl font-bold text-amber-600">{time}s</span>
      </div>
      <div className="flex items-center">
        <span className="mr-2">⭐</span>
        <span className="text-xl font-bold text-amber-600">{score} points</span>
      </div>
      <div className="flex items-center">
        <span className="text-sm mr-2 text-amber-600">Goal: 100 points</span>
        <div className="w-32 bg-gray-300 bg-opacity-50 rounded-full h-4">
          <div
            className="bg-amber-600 h-4 rounded-full"
            style={{ width: `${Math.min(100, score)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
} 