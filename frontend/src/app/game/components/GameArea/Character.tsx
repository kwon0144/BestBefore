/**
 * Character Component
 * Renders the player character and held food
 */
import React from 'react';
import { Position, Food } from '../../interfaces';

interface CharacterProps {
  position: Position;
  characterSize: number;
  holdingFood: Food | null;
}

/**
 * Renders the player character and the food they're holding
 */
export default function Character({ position, characterSize, holdingFood }: CharacterProps) {
  return (
    <div 
      className="absolute" 
      style={{ 
        left: position.x, 
        top: position.y, 
        width: characterSize, 
        height: characterSize,
        zIndex: 20
      }}
    >
      {/* Character sprite */}
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gray-600 rounded-full flex items-center justify-center">
          <span className="text-white text-2xl">🧑‍🌾</span>
        </div>
        
        {/* Holding food indicator */}
        {holdingFood && (
          <div 
            className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-white p-0.5 border border-gray-300"
            style={{ 
              backgroundImage: `url(${holdingFood.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* DIY indicator if food can be DIYed */}
            {holdingFood.diy_option && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-600" />
            )}
          </div>
        )}
      </div>
    </div>
  );
} 