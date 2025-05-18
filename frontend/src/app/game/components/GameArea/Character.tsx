/**
 * Character Component
 * Renders the player character and held food
 */
import React, { useState, useEffect } from 'react';
import { Position, Food } from '../../interfaces';

interface CharacterProps {
  position: Position;
  characterSize: number;
  holdingFood: Food | null;
  direction: 'front' | 'back' | 'left' | 'right';
  isMoving: boolean;
  spriteResources: {
    front_player?: string;
    back_player?: string;
    left_player?: string;
    right_player?: string;
  };
}

/**
 * Renders the player character and the food they're holding
 */
export default function Character({ 
  position, 
  characterSize, 
  holdingFood, 
  direction = 'front',
  isMoving = false,
  spriteResources = {}
}: CharacterProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameCount = 4; // Number of frames in each sprite sheet
  const frameWidth = 32; // Width of each frame in pixels
  const frameHeight = 32; // Height of each frame in pixels
  const scaleFactor = 2; // Scale factor to enlarge the character
  

  const getSpriteSheet = () => {
    switch(direction) {
      case 'front':
        return spriteResources.front_player;
      case 'back':
        return spriteResources.back_player;
      case 'left':
        return spriteResources.left_player;
      case 'right':
        return spriteResources.right_player;
      default:
        return spriteResources.front_player;
    }
  };
  

  useEffect(() => {
    if (!isMoving) {
      setCurrentFrame(0); // Reset to first frame when not moving
      return;
    }
    
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frameCount);
    }, 150); // Animation speed (150ms per frame)
    
    return () => clearInterval(interval);
  }, [isMoving]);
  
  // Check if we have a valid sprite sheet URL
  const hasSpriteSheet = Boolean(getSpriteSheet());
  
  // Calculate sprite sheet background position - with enlarged size
  const spriteStyle = hasSpriteSheet ? {
    backgroundImage: `url(${getSpriteSheet()})`,
    width: `${characterSize}px`,
    height: `${characterSize}px`,
    backgroundSize: `${frameWidth * frameCount * scaleFactor}px ${frameHeight * scaleFactor}px`, // Enlarged background size
    backgroundPosition: `-${currentFrame * frameWidth * scaleFactor}px 0px`, // Adjust position accordingly
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated' as const // Keep pixel art style
  } : {};
  
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
        {hasSpriteSheet ? (
          // Use sprite sheet animation
          <div className="absolute inset-0" style={spriteStyle}></div>
        ) : (
          // Fallback to default character - only shown when no sprite sheet is available
          <div className="absolute inset-0 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">🧑‍🌾</span>
          </div>
        )}
        
        {/* Holding food indicator */}
        {holdingFood && (
          <div 
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-white p-0.5 border border-gray-300"
            style={{ 
              backgroundImage: `url(${holdingFood.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* DIY indicator if food can be DIYed */}
            {holdingFood.diy_option === true && (
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-400 rounded-full border border-yellow-600" />
            )}
          </div>
        )}
      </div>
    </div>
  );
} 