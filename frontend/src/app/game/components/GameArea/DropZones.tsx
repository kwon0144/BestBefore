/**
 * DropZones Component
 * Renders the food bank, green bin, and DIY zones
 */
import React from 'react';

interface DropZonesProps {
  diyCooldown: number;
}

/**
 * Renders the drop zones where players can place food items
 */
export default function DropZones({ diyCooldown }: DropZonesProps) {
  return (
    <>
      {/* Food Bank - positioned in the center-left of the U-shaped conveyor belt */}
      <div className="absolute top-[200px] left-[150px] w-[150px] h-[150px] bg-blue-100 border-4 border-blue-500 rounded-lg flex flex-col items-center justify-center">
        <span className="text-blue-500 text-4xl mb-2">🏢</span>
        <span className="font-bold text-blue-700">Food Bank</span>
        <span className="text-sm text-blue-600 mt-1">(Q to donate)</span>
      </div>
      
      {/* Green Bin - positioned closer to the Food Bank */}
      <div className="absolute top-[200px] left-[350px] w-[150px] h-[150px] bg-green-100 border-4 border-green-500 rounded-lg flex flex-col items-center justify-center">
        <span className="text-green-500 text-4xl mb-2">♻️</span>
        <span className="font-bold text-green-700">Green Bin</span>
        <span className="text-sm text-green-600 mt-1">(Q to compost)</span>
      </div>

      {/* DIY Place - positioned next to Green Bin */}
      <div className="absolute top-[200px] left-[550px] w-[150px] h-[150px] bg-yellow-100 border-4 border-yellow-500 rounded-lg flex flex-col items-center justify-center">
        <span className="text-yellow-500 text-4xl mb-2">🏠</span>
        <span className="font-bold text-yellow-700">DIY Place</span>
        <span className="text-sm text-yellow-600 mt-1">(Q to DIY)</span>
        {diyCooldown > 0 && (
          <span className="absolute bottom-1 right-1 bg-yellow-200 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {diyCooldown}
          </span>
        )}
      </div>
    </>
  );
} 