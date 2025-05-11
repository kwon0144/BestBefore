/**
 * GameOver Component
 * Final screen showing game results and option to play again
 */
import React from 'react';
import { WasteStats } from '../../interfaces';

interface GameOverProps {
  score: number;
  wasteStats: WasteStats;
  handleStartGame: () => void;
}

/**
 * Game over component showing final score and play again option
 */
export default function GameOver({ score, wasteStats, handleStartGame }: GameOverProps) {
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

  // Format waste statistics
  const formatWasteStats = () => {
    if (wasteStats.totalWasted === 0) {
      return "Perfect! You didn't waste any food!";
    }

    const wastedItems = Object.values(wasteStats.wastedFoods)
      .filter(item => item.count > 0)
      .map(item => `${item.count} ${item.name}${item.count > 1 ? 's' : ''}`)
      .join(', ');

    return `You wasted ${wasteStats.totalWasted} items: ${wastedItems}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <h2 className="text-3xl font-bold text-center mb-4">Game Over!</h2>
        
        {/* Score and Rank */}
        <div className="text-center mb-6">
          <p className="text-2xl font-semibold mb-2">Final Score: {score}</p>
          <h3 className="text-xl font-bold text-green-600 mb-2">{playerRank.title}</h3>
          <p className="text-gray-600 mb-4">{playerRank.description}</p>
        </div>

        {/* Waste Statistics */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="text-lg font-semibold mb-2">Food Waste Statistics</h4>
          <p className="text-gray-700">{formatWasteStats()}</p>
        </div>
        
        {/* Play Again Button */}
        <div className="text-center">
          <button
            onClick={handleStartGame}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
} 