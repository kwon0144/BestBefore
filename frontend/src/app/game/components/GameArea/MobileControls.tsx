import React from 'react';

interface MobileControlsProps {
  onDirectionPress: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onDirectionRelease: () => void;
  onPickupPress: () => void;
}

export default function MobileControls({ onDirectionPress, onDirectionRelease, onPickupPress }: MobileControlsProps) {
  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-between px-4 touch-none">
      {/* D-Pad */}
      <div className="relative w-36 h-36">
        {/* Up button */}
        <button
          className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center active:bg-opacity-70"
          onTouchStart={() => onDirectionPress('up')}
          onTouchEnd={onDirectionRelease}
        >
          <span className="text-white text-2xl">↑</span>
        </button>
        
        {/* Down button */}
        <button
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center active:bg-opacity-70"
          onTouchStart={() => onDirectionPress('down')}
          onTouchEnd={onDirectionRelease}
        >
          <span className="text-white text-2xl">↓</span>
        </button>
        
        {/* Left button */}
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center active:bg-opacity-70"
          onTouchStart={() => onDirectionPress('left')}
          onTouchEnd={onDirectionRelease}
        >
          <span className="text-white text-2xl">←</span>
        </button>
        
        {/* Right button */}
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center active:bg-opacity-70"
          onTouchStart={() => onDirectionPress('right')}
          onTouchEnd={onDirectionRelease}
        >
          <span className="text-white text-2xl">→</span>
        </button>
      </div>

      {/* Pickup/Action Button */}
      <button
        className="w-20 h-20 bg-green-600 bg-opacity-50 rounded-full flex items-center justify-center active:bg-opacity-70"
        onClick={onPickupPress}
      >
        <span className="text-white font-bold">PICK</span>
      </button>
    </div>
  );
} 