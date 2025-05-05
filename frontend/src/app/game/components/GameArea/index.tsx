/**
 * GameArea Component
 * Main gameplay area that renders the game interface and manages game logic
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { updateGame } from '@/services/gameService';
import { Food as FoodType, FoodItem, Difficulty } from '../../interfaces';
import { playSound } from '../../utils/soundEffects';
import { getConveyorSpeed, getFoodGenerationInterval, isInZone } from '../../utils/gameLogic';

// Sub-components
import ScoreBoard from './ScoreBoard';
import ConveyorBelt from './ConveyorBelt';
import Character from './Character';
import DropZones from './DropZones';
import Food from './Food';
import MessageDisplay from './MessageDisplay';

interface GameAreaProps {
  gameId: string | null;
  score: number;
  setScore: (score: number) => void;
  time: number;
  setTime: (time: number) => void;
  difficulty: Difficulty;
  foodItems: FoodItem[];
  handleGameOver: () => Promise<void>;
}

/**
 * Main game area component that handles gameplay mechanics
 */
export default function GameArea({
  gameId,
  score,
  setScore,
  time,
  setTime,
  difficulty,
  foodItems,
  handleGameOver
}: GameAreaProps) {
  // Game state
  const [position, setPosition] = useState({ x: 200, y: 300 });
  const [holdingFood, setHoldingFood] = useState<FoodType | null>(null);
  const [foods, setFoods] = useState<FoodType[]>([]);
  const [eatingCooldown, setEatingCooldown] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false);
  const [lastActionTime, setLastActionTime] = useState<number>(0);
  
  // Refs
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  // Constants
  const characterSize = 60;
  const foodSize = 40;
  const moveSpeed = 10;
  const eatingCooldownTime = 5; // 5 seconds cooldown

  // Show message function
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    
    // Clear message after 2 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 2000);
  };

  // Generate food on the conveyor belt
  useEffect(() => {
    if (!gameId || !foodItems.length) return;

    const interval = setInterval(() => {
      if (foods.length < 5) {
        const randomFoodType = foodItems[Math.floor(Math.random() * foodItems.length)];
        
        console.log('Original food type from API:', randomFoodType.type);
        let foodType: 'donate' | 'compost' | 'eat' | 'trash' | 'foodbank' | 'greenbin' | 'both';
        
        if (randomFoodType.type.includes('eat')) {
          foodType = 'eat';
        } else if (randomFoodType.type.includes('donate') || randomFoodType.type.includes('foodbank')) {
          foodType = 'foodbank';
        } else if (randomFoodType.type.includes('compost') || randomFoodType.type.includes('greenbin')) {
          foodType = 'greenbin';
        } else if (randomFoodType.type.includes('both')) {
          foodType = 'both';
        } else if (randomFoodType.type.includes('trash')) {
          foodType = 'trash';
        } else {
          // 默认情况
          foodType = randomFoodType.type as any;
        }
        
        const newFood: FoodType = {
          id: Date.now(),
          type: foodType,
          x: -foodSize,
          y: 100 - foodSize / 2,
          name: randomFoodType.name,
          image: randomFoodType.image
        };
        
        // 调试: 输出转换后的类型
        console.log('Converted food type for game:', newFood.type);
        
        setFoods(prevFoods => [...prevFoods, newFood]);
      }
    }, getFoodGenerationInterval(difficulty));
    
    return () => clearInterval(interval);
  }, [gameId, foodItems, foods.length, difficulty]);

  // Move food on the conveyor belt
  useEffect(() => {
    if (!gameId) return;
    
    const moveInterval = setInterval(() => {
      const gameAreaWidth = gameAreaRef.current?.getBoundingClientRect().width ?? 800;
      const currentSpeed = getConveyorSpeed(difficulty);
      
      setFoods(prevFoods => {
        const newFoods = prevFoods.filter(food => {
          const newX = food.x + currentSpeed;
          if (newX >= gameAreaWidth) {
            // Handle food waste scoring
            if (gameId && food.type !== 'trash') {
              updateGame(gameId, 'incorrect', food.type)
                .then(response => {
                  setScore(response.score);
                  playSound('wasteFood');
                  showMessage('Food wasted! -5 points', 'error');
                })
                .catch(error => console.error('Failed to update score:', error));
            }
            return false;
          }
          food.x = newX;
          return true;
        });
        
        return newFoods;
      });
    }, 50);
    
    return () => clearInterval(moveInterval);
  }, [gameId, difficulty]);

  // Game timer
  useEffect(() => {
    if (!gameId) return;
    
    const timer = setInterval(async () => {
      if (time <= 1) {
        clearInterval(timer);
        handleGameOver();
        setTime(0);
      } else {
        setTime(time - 1);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameId, setTime, handleGameOver, time]);

  // Eating cooldown timer
  useEffect(() => {
    if (eatingCooldown <= 0) return;
    
    const cooldownTimer = setInterval(() => {
      setEatingCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(cooldownTimer);
  }, [eatingCooldown]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        handlePickup();
      } else if (key === 'e') {
        eatFood();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [foods, holdingFood, position, eatingCooldown]);

  // Handle pickup/drop food
  const handlePickup = useCallback(() => {
    // Prevent rapid actions
    const now = Date.now();
    if (now - lastActionTime < 300) return;
    setLastActionTime(now);
    
    if (isActionInProgress) return;
    setIsActionInProgress(true);
    
    try {
      // If already holding food, try to drop it
      if (holdingFood) {
        handleAction().then(() => {
          setIsActionInProgress(false);
        });
        return;
      }
      
      // Try to pick up food
      if (!holdingFood) {
        // Find food close to character
        const foodIndex = foods.findIndex(food => {
          const dx = (position.x + characterSize / 2) - (food.x + foodSize / 2);
          const dy = (position.y + characterSize / 2) - (food.y + foodSize / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < (characterSize / 2 + foodSize / 2);
        });
        
        if (foodIndex >= 0) {
          const pickedFood = foods[foodIndex];
          setHoldingFood(pickedFood);
          setFoods(prev => prev.filter((_, i) => i !== foodIndex));
          playSound('donate');
        }
      }
    } finally {
      setIsActionInProgress(false);
    }
  }, [foods, holdingFood, position, lastActionTime, isActionInProgress]);

  // Handle action (dropping food in zones)
  const handleAction = useCallback(async () => {
    if (!holdingFood || !gameId) return;
    
    const foodBankZone = { x: 250, y: 400, width: 150, height: 150 };
    const greenBinZone = { x: 450, y: 400, width: 150, height: 150 };
    
    const playerCenterX = position.x + characterSize / 2;
    const playerCenterY = position.y + characterSize / 2;
    
    let actionType = 'incorrect';
    let successMessage = '';
    
    if (isInZone(playerCenterX, playerCenterY, foodBankZone.x, foodBankZone.y, foodBankZone.width, foodBankZone.height)) {
      // Food Bank zone
      if (holdingFood.type === 'donate' || holdingFood.type === 'foodbank' || holdingFood.type === 'both') {
        actionType = 'correct';
        successMessage = 'Great job! Food donated!';
      } else {
        successMessage = 'Wrong zone! This food cannot be donated.';
      }
    } else if (isInZone(playerCenterX, playerCenterY, greenBinZone.x, greenBinZone.y, greenBinZone.width, greenBinZone.height)) {
      // Green Bin zone
      if (holdingFood.type === 'compost' || holdingFood.type === 'greenbin' || holdingFood.type === 'both') {
        actionType = 'correct';
        successMessage = 'Great job! Food composted!';
      } else {
        successMessage = 'Wrong zone! This food cannot be composted.';
      }
    } else {
      // No zone, just drop the food
      setHoldingFood(null);
      return;
    }
    
    try {
      const response = await updateGame(gameId, actionType, holdingFood.type);
      setScore(response.score);
      
      if (actionType === 'correct') {
        playSound('donate');
        showMessage(successMessage, 'success');
      } else {
        playSound('wrongAction');
        showMessage(successMessage, 'error');
      }
    } catch (error) {
      console.error('Failed to update score:', error);
    } finally {
      setHoldingFood(null);
    }
  }, [holdingFood, gameId, position, characterSize]);

  // Eat food function
  const eatFood = useCallback(async () => {
    if (!holdingFood || !gameId || eatingCooldown > 0) return;
    
    console.log('Trying to eat food with type:', holdingFood.type);
    
    if (holdingFood.type === 'eat' || String(holdingFood.type).includes('eat')) {
      try {
        const response = await updateGame(gameId, 'correct', 'eat');
        setScore(response.score);
        setEatingCooldown(eatingCooldownTime);
        playSound('eatFood');
        showMessage('Yum! Food eaten!', 'success');
      } catch (error) {
        console.error('Failed to update score:', error);
      } finally {
        setHoldingFood(null);
      }
    } else {
      playSound('wrongAction');
      showMessage('This food should not be eaten!', 'error');
    }
  }, [holdingFood, gameId, eatingCooldown]);

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Score Display */}
      <ScoreBoard score={score} time={time} />
      
      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="relative w-full h-[600px] bg-gray-100 overflow-hidden"
      >
        {/* Conveyor belt */}
        <ConveyorBelt />
        
        {/* Drop zones */}
        <DropZones eatingCooldown={eatingCooldown} />
        
        {/* Foods on conveyor belt */}
        <Food foods={foods} foodSize={foodSize} />
        
        {/* Character */}
        <Character 
          position={position} 
          characterSize={characterSize} 
          holdingFood={holdingFood} 
        />
        
        {/* Message display */}
        <MessageDisplay message={message} messageType={messageType} />
      </div>
    </div>
  );
} 