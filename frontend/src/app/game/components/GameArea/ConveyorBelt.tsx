/**
 * ConveyorBelt Component
 * Displays the conveyor belt visual in the game area
 */
import React from 'react';

/**
 * Renders the conveyor belt with animated segments
 */
export default function ConveyorBelt() {
  return (
    <div className="absolute top-[100px] left-0 right-0 h-[50px] bg-gray-400 border-t-2 border-b-2 border-gray-600">
      <div className="h-full w-full flex items-center overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="h-[10px] w-[40px] bg-gray-600 mx-[20px]"></div>
        ))}
      </div>
    </div>
  );
} 