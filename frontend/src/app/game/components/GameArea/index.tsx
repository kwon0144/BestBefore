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

// Add a new interface for tracking food movement on the conveyor
interface ConveyorSegment {
  id: string;
  start: { x: number, y: number };
  end: { x: number, y: number };
  direction: 'right' | 'down' | 'left' | 'up';
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
  const [diyCooldown, setDiyCooldown] = useState<number>(0);
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
  const diyCooldownTime = 5; // 5 seconds cooldown

  // Define the conveyor segments
  const conveyorSegments = [
    { 
      id: 'top', 
      start: { x: 50, y: 125 }, // Starting from left side of top segment with offset
      end: { x: 1000, y: 125 },  // End at right side of top segment
      direction: 'right' as const
    },
    { 
      id: 'right', 
      start: { x: 1000, y: 150 }, // Right side going down
      end: { x: 1000, y: 450 },   // To bottom right corner
      direction: 'down' as const
    },
    { 
      id: 'bottom', 
      start: { x: 1000, y: 450 }, // Bottom right to bottom left
      end: { x: 50, y: 450 },    // End at bottom left
      direction: 'left' as const
    }
    // No left vertical segment - food resets to start after bottom segment
  ];

  // Add a state for prepared game food items
  const [gameFoodItems, setGameFoodItems] = useState<FoodItem[]>([]);
  
  // Prepare balanced food items when component mounts
  useEffect(() => {
    if (foodItems && foodItems.length > 0) {
      setGameFoodItems(foodItems);
      console.log('Received game food items from API:', foodItems.length);
    }
  }, [foodItems]);

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
    if (!gameId || !gameFoodItems.length) return;

    const interval = setInterval(() => {
      if (foods.length < 8) {
        // Select a random food item from the prepared list
        const randomIndex = Math.floor(Math.random() * gameFoodItems.length);
        const randomFoodType = gameFoodItems[randomIndex];
        
        console.log('Original food type from API:', randomFoodType.type);
        let foodType: 'food bank' | 'green waste bin' | 'trash';
        
        // Updated type conversion logic to match new database structure
        const typeStr = String(randomFoodType.type).toLowerCase();
        
        // Match exact types from database
        if (typeStr === 'food bank') {
          foodType = 'food bank';
        } else if (typeStr === 'green waste bin') {
          foodType = 'green waste bin';
        } else if (typeStr === 'trash') {
          foodType = 'trash';
        } else {
          // If type doesn't match any known types, default to food bank as fallback
          console.warn(`Unknown food type: ${typeStr}, defaulting to 'food bank'`);
          foodType = 'food bank';
        }
        
        // Start food at the beginning of the top segment
        const startSegment = conveyorSegments[0];
        
        // Check if this item has DIY option (use the value from API or randomly assign for 30% of non-trash items)
        const hasDiyOption = randomFoodType.diy_option !== undefined 
          ? Boolean(randomFoodType.diy_option) 
          : (foodType !== 'trash' && Math.random() < 0.3);
        
        const newFood: FoodType = {
          id: Date.now(),
          type: foodType,
          x: startSegment.start.x,
          y: startSegment.start.y,
          name: randomFoodType.name,
          image: randomFoodType.image,
          segment: 0,  // Track which segment the food is on
          diy_option: hasDiyOption
        };
        
        // Debug: output converted type
        console.log('Converted food type for game:', newFood.type, 'DIY option:', newFood.diy_option);
        
        setFoods(prevFoods => [...prevFoods, newFood]);
      }
    }, getFoodGenerationInterval(difficulty));
    
    return () => clearInterval(interval);
  }, [gameId, gameFoodItems, foods.length, difficulty]);

  // Move food on the conveyor belt
  useEffect(() => {
    if (!gameId) return;
    
    const moveInterval = setInterval(() => {
      const gameAreaWidth = gameAreaRef.current?.getBoundingClientRect().width ?? 800;
      const gameAreaHeight = gameAreaRef.current?.getBoundingClientRect().height ?? 600;
      const currentSpeed = getConveyorSpeed(difficulty);
      
      setFoods(prevFoods => {
        // Create a new array to store foods that haven't fallen off
        const newFoods = [];
        
        for (const food of prevFoods) {
          // Get current segment
          const segment = food.segment !== undefined ? food.segment : 0;
          const currentSegment = conveyorSegments[segment];
          
          // Flag to track if food should be kept
          let keepFood = true;
          
          // Update position based on segment direction
          switch (currentSegment.direction) {
            case 'right':
              food.x += currentSpeed;
              // Check if reached end of segment
              if (food.x >= currentSegment.end.x) {
                food.x = conveyorSegments[segment + 1].start.x;
                food.y = conveyorSegments[segment + 1].start.y;
                food.segment = segment + 1;
              }
              break;
            case 'down':
              food.y += currentSpeed;
              // Check if reached end of segment
              if (food.y >= currentSegment.end.y) {
                food.x = conveyorSegments[segment + 1].start.x;
                food.y = conveyorSegments[segment + 1].start.y;
                food.segment = segment + 1;
              }
              break;
            case 'left':
              food.x -= currentSpeed;
              // Check if reached end of segment - reset to start of first segment
              if (food.x <= currentSegment.end.x) {
                // Check if we should apply food waste scoring
                if (gameId && food.type !== 'trash') {
                  // Only penalize for non-trash items falling off
                  updateGame(gameId, 'incorrect', food.type)
                    .then(response => {
                      setScore(response.score);
                      playSound('wasteFood');
                      showMessage('-5 points. Food wasted!', 'error');
                    })
                    .catch(error => console.error('Failed to update score:', error));
                  keepFood = false;
                } else if (food.type === 'trash') {
                  // For trash items, just let them fall off with no penalty
                  keepFood = false;
                  showMessage('Good! Trash disposed properly!', 'success');
                } else {
                  // Reset food to beginning of the conveyor
                  food.x = conveyorSegments[0].start.x;
                  food.y = conveyorSegments[0].start.y;
                  food.segment = 0;
                }
              }
              break;
          }
          
          // Add food to the new array if it should be kept
          if (keepFood) {
            newFoods.push(food);
          }
        }
        
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

  // DIY cooldown timer
  useEffect(() => {
    if (diyCooldown <= 0) return;
    
    const cooldownTimer = setInterval(() => {
      setDiyCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(cooldownTimer);
  }, [diyCooldown]);

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
        diyFood();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [foods, holdingFood, position, diyCooldown]);

  // Handle pickup/drop food
  const handlePickup = useCallback(() => {
    // Prevent rapid actions
    const now = Date.now();
    if (now - lastActionTime < 300) return;
    setLastActionTime(now);
    
    if (isActionInProgress) return;
    setIsActionInProgress(true);
    
    try {
      // If already holding food, try to drop it in a designated zone
      if (holdingFood) {
        console.log('Attempting to drop food:', holdingFood.name, holdingFood.type);
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
          console.log('Picking up food:', pickedFood.name, pickedFood.type);
          setHoldingFood(pickedFood);
          setFoods(prev => prev.filter((_, i) => i !== foodIndex));
          // No sound for pickup
        }
      }
    } finally {
      setIsActionInProgress(false);
    }
  }, [foods, holdingFood, position, lastActionTime, isActionInProgress]);

  // Handle action (dropping food in zones)
  const handleAction = useCallback(async () => {
    if (!holdingFood || !gameId) return;
    
    // Update the coordinates to match the new positions
    const foodBankZone = { x: 150, y: 200, width: 150, height: 150 };
    const greenBinZone = { x: 350, y: 200, width: 150, height: 150 }; 
    const diyZone = { x: 550, y: 200, width: 150, height: 150 }; // Added DIY zone
    
    const playerCenterX = position.x + characterSize / 2;
    const playerCenterY = position.y + characterSize / 2;
    
    // Check if player is in any drop zone
    const inFoodBankZone = isInZone(playerCenterX, playerCenterY, foodBankZone.x, foodBankZone.y, foodBankZone.width, foodBankZone.height);
    const inGreenBinZone = isInZone(playerCenterX, playerCenterY, greenBinZone.x, greenBinZone.y, greenBinZone.width, greenBinZone.height);
    const inDiyZone = isInZone(playerCenterX, playerCenterY, diyZone.x, diyZone.y, diyZone.width, diyZone.height);
    
    // If not in any zone, do nothing and keep holding the food
    if (!inFoodBankZone && !inGreenBinZone && !inDiyZone) {
      console.log('Not in a valid drop zone, still holding food');
      return;
    }
    
    let actionType = 'incorrect';
    let successMessage = '';
    let scoreChange = 0;
    
    if (inFoodBankZone) {
      // Food Bank zone
      if (holdingFood.type === 'food bank') {
        actionType = 'correct';
        scoreChange = 10;
        successMessage = 'Great job! Food donated!';
      } else {
        scoreChange = -5;
        successMessage = 'Wrong zone! This food cannot be donated.';
      }
    } else if (inGreenBinZone) {
      // Green Bin zone
      if (holdingFood.type === 'green waste bin') {
        actionType = 'correct';
        scoreChange = 10;
        successMessage = 'Great job! Food composted!';
      } else {
        scoreChange = -5;
        successMessage = 'Wrong zone! This food cannot be composted.';
      }
    } else if (inDiyZone) {
      // DIY zone
      if (holdingFood.diy_option) {
        actionType = 'correct';
        scoreChange = 15;
        successMessage = 'Amazing! You made something new!';
      } else {
        scoreChange = -5;
        successMessage = 'Wrong zone! This food cannot be used for DIY.';
      }
    }
    
    try {
      const response = await updateGame(gameId, actionType, holdingFood.type);
      setScore(response.score);
      
      // Format message with score change first
      const formattedMessage = `${scoreChange >= 0 ? '+' : ''}${scoreChange} points. ${successMessage}`;
      
      if (actionType === 'correct') {
        playSound('donate');
        showMessage(formattedMessage, 'success');
      } else {
        playSound('wrongAction');
        showMessage(formattedMessage, 'error');
      }
    } catch (error) {
      console.error('Failed to update score:', error);
    } finally {
      setHoldingFood(null);
    }
  }, [holdingFood, gameId, position, characterSize]);

  // DIY food function - directly DIY food with E key
  const diyFood = useCallback(async () => {
    if (!holdingFood || !gameId || diyCooldown > 0) return;
    
    console.log('Trying to DIY food with type:', holdingFood.type);
    
    // Check if the food can be DIYed
    if (holdingFood.diy_option) {
      try {
        const response = await updateGame(gameId, 'correct', 'diy');
        setScore(response.score);
        setDiyCooldown(diyCooldownTime);
        playSound('diyFood');
        showMessage('+15 points. Great DIY creation!', 'success');
      } catch (error) {
        console.error('Failed to update score:', error);
      } finally {
        setHoldingFood(null);
      }
    } else {
      playSound('wrongAction');
      showMessage('-5 points. This food cannot be used for DIY!', 'error');
    }
  }, [holdingFood, gameId, diyCooldown]);

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
        <DropZones diyCooldown={diyCooldown} />
        
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