/**
 * Game logic utilities
 * Contains helper functions for game calculations and mechanics
 */
import { Difficulty } from '../interfaces';

/**
 * Get conveyor speed based on selected difficulty
 * @param difficulty - Game difficulty level
 * @returns Speed multiplier for the conveyor belt
 */
export const getConveyorSpeed = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case 'easy': return 1.5;
    case 'normal': return 2;
    case 'hard': return 3;
    default: return 2;
  }
};

/**
 * Get food generation interval based on difficulty
 * @param difficulty - Game difficulty level
 * @returns Interval in milliseconds between food item generation
 */
export const getFoodGenerationInterval = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case 'easy': return 4000; // 4 seconds
    case 'normal': return 3500; // 3.5 seconds
    case 'hard': return 3000; // 3 seconds
    default: return 3500;
  }
};

/**
 * Check if player is in drop zone
 * @param playerX - Player x position
 * @param playerY - Player y position
 * @param zoneX - Zone x position
 * @param zoneY - Zone y position
 * @param zoneWidth - Zone width
 * @param zoneHeight - Zone height
 * @returns Whether player is in the specified zone
 */
export const isInZone = (
  playerX: number, 
  playerY: number, 
  zoneX: number, 
  zoneY: number, 
  zoneWidth: number, 
  zoneHeight: number
): boolean => {
  return (
    playerX >= zoneX && 
    playerX <= zoneX + zoneWidth && 
    playerY >= zoneY && 
    playerY <= zoneY + zoneHeight
  );
}; 