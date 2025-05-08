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
    if (score >= 200) {
      return {
        title: "Zero-Waste Legend",
        description: "You're a true champion of sustainable living! Your exceptional sorting skills and DIY creativity have made you a role model for waste reduction."
      };
    } else if (score >= 160) {
      return {
        title: "Zero-Waste Expert",
        description: "Outstanding work! Your deep understanding of food waste management and creative reuse has made a significant impact."
      };
    } else if (score >= 120) {
      return {
        title: "Zero-Waste Champion",
        description: "Great job! You've shown excellent skills in sorting and repurposing food items. Keep up the good work!"
      };
    } else if (score >= 80) {
      return {
        title: "Zero-Waste Saver",
        description: "Good effort! You understand the basics of food waste management. With a bit more practice, you'll become even better!"
      };
    } else if (score >= 40) {
      return {
        title: "Zero-Waste Learner",
        description: "You're on the right track! Keep learning about food waste reduction and you'll improve your sorting skills."
      };
    } else {
      return {
        title: "Waste Joker",
        description: "Don't worry! Everyone starts somewhere. Keep practicing and you'll get better at managing food waste."
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
        score >= 200 ? 'text-purple-600' :
        score >= 160 ? 'text-green-600' : 
        score >= 120 ? 'text-blue-600' :
        score >= 80 ? 'text-yellow-600' :
        score >= 40 ? 'text-orange-600' : 
        'text-red-600'
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