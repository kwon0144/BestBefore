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
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-green-800 mb-4 text-center">How to Play</h2>
      
      {/* Game Objective */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-green-700 mb-2">Game Objective</h3>
        <p className="text-gray-700">
          Sort food items by moving your character and picking up food from the conveyor belt.
          Place each food in the correct destination based on its condition to earn points and prevent food waste.
          You can also DIY new items from eligible food by taking them to the DIY Place.
        </p>
      </div>
      
      {/* Controls */}
      <div className="mb-5 bg-gray-50 p-3 rounded-lg">
        <h3 className="text-lg font-semibold text-green-700 mb-2">Controls</h3>
        <ul className="text-gray-700">
          <li className="mb-1"><strong>WASD</strong> or <strong>Arrow Keys</strong>: Move your character</li>
          <li className="mb-1"><strong>Q</strong> or <strong>J</strong>: Pick up/drop food</li>
        </ul>
      </div>
      
      {/* Food Types */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-green-700 mb-2">Food Types & Destinations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-bold text-blue-800 flex items-center">
              <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
              Food Bank Items
            </h4>
            <p className="text-sm text-blue-700">Sealed, non-perishable, safe to donate items</p>
            <p className="text-xs text-blue-600 mt-1">Examples: Canned goods, pasta, rice, unopened cereals</p>
            <p className="text-xs text-blue-600 mt-1">Place in the blue Food Bank zone (Q or J)</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-bold text-green-800 flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
              Green Bin Items
            </h4>
            <p className="text-sm text-green-700">Spoiled food, scraps, and compostable items</p>
            <p className="text-xs text-green-600 mt-1">Examples: Fruit/vegetable scraps, coffee grounds, eggshells</p>
            <p className="text-xs text-green-600 mt-1">Place in the green Compost zone (Q or J)</p>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg">
            <h4 className="font-bold text-red-800 flex items-center">
              <span className="w-4 h-4 bg-red-500 rounded-full mr-2"></span>
              Trash Items
            </h4>
            <p className="text-sm text-red-700">Items that can&apos;t be composted, donated or DIYed</p>
            <p className="text-xs text-red-600 mt-1">Examples: Contaminated packaging, inedible waste</p>
            <p className="text-xs text-red-600 mt-1">These items should be thrown away (let them fall off)</p>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h4 className="font-bold text-yellow-800 flex items-center">
              <span className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></span>
              DIY Items
            </h4>
            <p className="text-sm text-yellow-700">Some food items can be repurposed into something new</p>
            <p className="text-xs text-yellow-600 mt-1">Look for food items with a yellow circle indicator</p>
            <p className="text-xs text-yellow-600 mt-1">Take them to the DIY Place zone (Q or J)</p>
          </div>
        </div>
      </div>
      
      {/* Game Strategy */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-green-700 mb-2">Game Strategy</h3>
        <ul className="text-gray-700 list-disc pl-5">
          <li>Act quickly! Food items move along the conveyor belt and will fall off if not handled</li>
          <li>Look for food items with a yellow circle - these can be DIYed at the DIY Place</li>
          <li>Sort items correctly between the Food Bank and Green Bin</li>
          <li>Let trash items fall off the conveyor - don&apos;t pick them up!</li>
        </ul>
      </div>
      
      {/* Scoring */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-green-700 mb-2">Scoring</h3>
        <ul className="text-gray-700 list-disc pl-5">
          <li>+10 points for correctly donating or composting food</li>
          <li>+15 points for creating a DIY item</li>
          <li>-5 points for incorrect placement</li>
          <li>-5 points for letting non-trash food fall off the conveyor belt</li>
          <li>No penalty for letting trash fall off</li>
          <li>Reach 100 points to become a food waste sorting expert!</li>
        </ul>
      </div>
      
      {/* Start Game Button */}
      <div className="text-center mt-6">
        <button
          onClick={handleStartGame}
          className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 !rounded-button whitespace-nowrap cursor-pointer"
        >
          Start Game
        </button>
      </div>
    </div>
  );
} 