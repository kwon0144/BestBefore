/**
 * ConveyorBelt Component
 * Displays the U-shaped conveyor belt visual in the game area
 */
import React from 'react';

/**
 * Renders the U-shaped conveyor belt with animated segments
 */
export default function ConveyorBelt() {
  return (
    <>
      {/* Top horizontal section (left to right) */}
      <div className="absolute top-[100px] left-[50px] right-[50px] h-[50px] bg-gray-400 border-t-2 border-b-2 border-l-2 border-r-2 border-gray-600">
        <div className="h-full w-full flex items-center overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={`top-${i}`} className="h-[10px] w-[40px] bg-gray-600 mx-[20px]"></div>
          ))}
        </div>
      </div>
      
      {/* Right vertical section (top to bottom) */}
      <div className="absolute top-[150px] right-[50px] w-[50px] h-[350px] bg-gray-400 border-l-2 border-r-2 border-gray-600">
        <div className="h-full w-full flex flex-col justify-evenly items-center">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`right-${i}`} className="w-[30px] h-[10px] bg-gray-600"></div>
          ))}
        </div>
      </div>
      
      {/* Bottom horizontal section (right to left) */}
      <div className="absolute bottom-[100px] left-[50px] right-[50px] h-[50px] bg-gray-400 border-t-2 border-b-2 border-l-2 border-r-2 border-gray-600">
        <div className="h-full w-full flex flex-row-reverse items-center overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={`bottom-${i}`} className="h-[10px] w-[40px] bg-gray-600 mx-[20px]"></div>
          ))}
        </div>
      </div>
    </>
  );
} 