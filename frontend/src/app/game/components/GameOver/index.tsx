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
  // Determine player rank based on score
  const getRank = () => {
    if (score >= 60) {
      return {
        title: "Zero-Waste Legend",
        description: "You're an expert at avoiding food waste!"
      };
    } else if (score >= 30) {
      return {
        title: "Zero-Waste Saver",
        description: "You understand how to avoid food waste."
      };
    } else {
      return {
        title: "Waste Joker",
        description: "You need to improve your waste sorting skills."
      };
    }
  };

  const playerRank = getRank();

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-green-800 mb-4">Game Over!</h2>
      <p className="text-xl mb-2">Your score: <span className="font-bold text-green-600">{score}</span></p>
      
      {/* Player rank title with appropriate color */}
      <h3 className={`text-xl font-bold mb-2 ${
        score >= 60 ? 'text-green-600' : 
        score >= 30 ? 'text-blue-600' : 
        'text-orange-600'
      }`}>
        {playerRank.title}
      </h3>
      
      {/* Player rank description */}
      <p className="mb-6 text-gray-700">
        {playerRank.description}
      </p>
      
      <button
        onClick={handleStartGame}
        className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 !rounded-button whitespace-nowrap cursor-pointer"
      >
        Return to Menu
      </button>
    </div>
  );
} 