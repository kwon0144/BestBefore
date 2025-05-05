/**
 * HowToPlay Component
 * Game instructions screen that shows controls and gameplay information
 */
import React from 'react';

interface HowToPlayProps {
  handleStartGame: () => void;
}

/**
 * How to play instructions and game start button
 */
export default function HowToPlay({ handleStartGame }: HowToPlayProps) {
  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-green-800 mb-4">How to Play</h2>
      <p className="mb-4 text-gray-700">
        Sort food items by moving your character and pressing F to pick them up from the conveyor belt.
        Place them in the correct destination:
      </p>
      <ul className="mb-6 text-left mx-auto inline-block">
        <li className="flex items-center mb-2">
          <span className="w-6 h-6 bg-blue-500 rounded-full mr-2"></span>
          <span>Food Bank: For edible food that can be donated</span>
        </li>
        <li className="flex items-center mb-2">
          <span className="w-6 h-6 bg-green-500 rounded-full mr-2"></span>
          <span>Green Bin: For food waste that should be composted</span>
        </li>
        <li className="flex items-center mb-2">
          <span className="w-6 h-6 bg-yellow-500 rounded-full mr-2"></span>
          <span>Eat: For food that's best consumed directly (5s cooldown)</span>
        </li>
      </ul>
      <p className="mb-6 text-gray-700">
        <strong>Controls:</strong> WASD to move, Q to pick up/drop food, E to eat food
      </p>
      <button
        onClick={handleStartGame}
        className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 !rounded-button whitespace-nowrap cursor-pointer"
      >
        Start Game
      </button>
    </div>
  );
} 