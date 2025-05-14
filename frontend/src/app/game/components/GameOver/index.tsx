/**
 * GameOver Component
 * Final screen showing game results and option to play again
 */
import React, { useRef } from 'react';
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
  const statsRef = useRef<HTMLDivElement>(null);

  const scrollToStats = () => {
    if (statsRef.current) {
      const startPosition = window.pageYOffset;
      const targetPosition = statsRef.current.getBoundingClientRect().top + startPosition;
      const distance = targetPosition - startPosition;
      const duration = 2000; // 2 seconds duration
      let start: number | null = null;

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);

        // Easing function for smoother animation
        const easeInOutQuad = (t: number) => {
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        };

        window.scrollTo(0, startPosition + (distance * easeInOutQuad(progress)));

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    }
  };

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
    <div className="min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4 space-y-48">
        {/* Top Section - White Background */}
        <div className="bg-white rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-red-600 mb-4">Game Over!</h2>
            <p className="text-2xl text-gray-700 mb-4">Final Score: {score}</p>
            <h3 className="text-2xl font-bold text-green-600 mb-2">{playerRank.title}</h3>
            <p className="text-lg text-gray-600 mb-8">{playerRank.description}</p>
            
            {/* Main buttons */}
            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={handleStartGame}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-3 px-8 rounded-lg text-lg font-bold text-yellow-900 hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🎮 Play Again 🎮
              </button>
              
              <button
                onClick={scrollToStats}
                className="bg-gradient-to-r from-emerald-400 to-emerald-500 py-3 px-8 rounded-lg text-lg font-bold text-emerald-900 hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                📊 View Stats 📊
              </button>
            </div>
          </div>
        </div>

        {/* Add extra spacing */}
        <div className="h-48"></div>

        {/* Bottom Stats Section - White Background */}
        <div ref={statsRef} className="bg-white rounded-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Wasted Food Items</h3>
          
          {Object.entries(wasteStats.wastedFoods).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(wasteStats.wastedFoods).map(([name, info]) => (
                <div 
                  key={name}
                  className="flex justify-between items-center bg-red-50 p-4 rounded-lg border border-red-200"
                >
                  <span className="text-lg text-gray-700">{name}</span>
                  <span className="text-lg font-semibold text-red-600">
                    × {info.count}
                  </span>
                </div>
              ))}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xl text-gray-800 font-semibold">
                  Total Items Wasted: <span className="text-red-600">{wasteStats.totalWasted}</span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-lg text-gray-600 text-center">
              No food was wasted! Great job! 🌟
            </p>
          )}
        </div>

        {/* Add bottom spacing */}
        <div className="h-24"></div>
      </div>
    </div>
  );
} 