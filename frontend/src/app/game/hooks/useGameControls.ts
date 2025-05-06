/**
 * Custom hook for game controls
 * Handles keyboard input and character movement
 */
import { useState, useEffect, useCallback } from 'react';
import { Position } from '../interfaces';

interface UseGameControlsProps {
  gameStarted: boolean;
  gameOver: boolean;
  gameAreaRef: React.RefObject<HTMLDivElement>;
  characterSize: number;
  moveSpeed: number;
  onAction: () => void;
  onPickup: () => void;
  onEat: () => void;
}

/**
 * Hook for managing game controls and character position
 * @param props - Control configuration
 * @returns Position state and related functions
 */
export default function useGameControls({
  gameStarted,
  gameOver,
  gameAreaRef,
  characterSize,
  moveSpeed,
  onAction,
  onPickup,
  onEat
}: UseGameControlsProps) {
  // Character position state
  const [position, setPosition] = useState<Position>({ x: 200, y: 300 });
  
  // Handle keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!gameStarted || gameOver) return;
    
    const key = e.key.toLowerCase();
    const gameAreaWidth = gameAreaRef.current?.clientWidth ?? 800;
    const gameAreaHeight = gameAreaRef.current?.clientHeight ?? 600;
    
    // Movement controls (WASD)
    setPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;
      
      // Horizontal movement
      if (key === 'a' || key === 'arrowleft') {
        newX = Math.max(0, prev.x - moveSpeed);
      } else if (key === 'd' || key === 'arrowright') {
        newX = Math.min(gameAreaWidth - characterSize, prev.x + moveSpeed);
      }
      
      // Vertical movement
      if (key === 'w' || key === 'arrowup') {
        newY = Math.max(0, prev.y - moveSpeed);
      } else if (key === 's' || key === 'arrowdown') {
        newY = Math.min(gameAreaHeight - characterSize, prev.y + moveSpeed);
      }
      
      return { x: newX, y: newY };
    });
    
    // Action controls
    if (key === 'q' || key === ' ') {
      onPickup(); // Pickup/drop food
    } else if (key === 'e') {
      onEat(); // Eat food
    } else if (key === 'f') {
      onAction(); // General action button
    }
  }, [gameStarted, gameOver, gameAreaRef, characterSize, moveSpeed, onAction, onPickup, onEat]);
  
  // Set up keyboard event listeners
  useEffect(() => {
    if (gameStarted && !gameOver) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [gameStarted, gameOver, handleKeyDown]);
  
  return { position, setPosition };
} 