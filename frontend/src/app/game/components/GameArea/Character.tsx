/**
 * Character Component
 * Renders the player's character and any food being held
 */
import React from 'react';
import { Position, Food } from '../../interfaces';

interface CharacterProps {
  position: Position;
  characterSize: number;
  holdingFood: Food | null;
}

/**
 * Renders the player character with any held food items
 */
export default function Character({ position, characterSize, holdingFood }: CharacterProps) {
  return (
    <div
      className="absolute transition-all duration-100 ease-linear"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${characterSize}px`,
        height: `${characterSize}px`
      }}
    >
      <div className="w-full h-full bg-purple-500 rounded-full flex items-center justify-center relative">
        <i className="fas fa-user text-white text-2xl"></i>
        {/* Food being held */}
        {holdingFood && (
          <div className="absolute -top-[30px] -right-[10px] w-[30px] h-[30px]">
            <img
              src={holdingFood.image}
              alt={holdingFood.name}
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
} 