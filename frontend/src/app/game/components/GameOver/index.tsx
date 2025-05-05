/**
 * GameOver Component
 * Final screen showing game results and option to play again
 */
import React from 'react';

interface GameOverProps {
  score: number;
  handleStartGame: () => void;
}

/**
 * Game over component showing final score and play again option
 */
export default function GameOver({ score, handleStartGame }: GameOverProps) {
  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-green-800 mb-4">Game Over!</h2>
      <p className="text-xl mb-4">Your score: <span className="font-bold text-green-600">{score}</span></p>
      <p className="mb-6 text-gray-700">
        {score >= 100
          ? "Great job! You're a food waste sorting expert!"
          : "Keep practicing to improve your food waste sorting skills!"}
      </p>
      <button
        onClick={handleStartGame}
        className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 !rounded-button whitespace-nowrap cursor-pointer"
      >
        Play Again
      </button>
    </div>
  );
} 