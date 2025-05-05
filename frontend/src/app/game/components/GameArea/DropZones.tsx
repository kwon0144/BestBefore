/**
 * DropZones Component
 * Renders the food bank, green bin, and eat zones
 */
import React from 'react';

interface DropZonesProps {
  eatingCooldown: number;
}

/**
 * Renders the drop zones where players can place food items
 */
export default function DropZones({ eatingCooldown }: DropZonesProps) {
  return (
    <>
      {/* Food Bank */}
      <div className="absolute bottom-[50px] left-[250px] w-[150px] h-[150px] bg-blue-100 border-4 border-blue-500 rounded-lg flex flex-col items-center justify-center">
        <span className="text-blue-500 text-4xl mb-2">🏢</span>
        <span className="font-bold text-blue-700">Food Bank</span>
        <span className="text-sm text-blue-600 mt-1">(Q to donate)</span>
      </div>
      
      {/* Green Bin */}
      <div className="absolute bottom-[50px] left-[450px] w-[150px] h-[150px] bg-green-100 border-4 border-green-500 rounded-lg flex flex-col items-center justify-center">
        <span className="text-green-500 text-4xl mb-2">♻️</span>
        <span className="font-bold text-green-700">Green Bin</span>
        <span className="text-sm text-green-600 mt-1">(Q to compost)</span>
      </div>
      
      {/* Eat Button */}
      <div className="absolute top-[250px] right-[50px] w-[150px] h-[80px] bg-yellow-100 border-4 border-yellow-500 rounded-lg flex flex-col items-center justify-center">
        <div className="flex items-center justify-center">
          <span className="text-yellow-500 text-2xl mr-2">🍽️</span>
          <span className="font-bold text-yellow-700">Eat (E)</span>
        </div>
        {eatingCooldown > 0 && (
          <div className="mt-1 text-sm text-yellow-700">
            Cooldown: {eatingCooldown}s
          </div>
        )}
      </div>
      
      {/* Food Guide Panel - only shown at start of game */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-md">
        <h3 className="font-bold text-green-800 mb-2">Food Guide:</h3>
        <ul className="text-sm">
          <li className="mb-1 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            <span>Donate: Sealed, non-perishable items (Space)</span>
          </li>
          <li className="mb-1 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span>Compost: Spoiled food, scraps (Space)</span>
          </li>
          <li className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            <span>Eat: Fresh, ready-to-eat items (E)</span>
          </li>
        </ul>
      </div>
    </>
  );
} 