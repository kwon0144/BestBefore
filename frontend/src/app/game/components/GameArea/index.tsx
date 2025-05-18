/**
 * GameArea Component
 * Main gameplay area that renders the game interface and manages game logic
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { updateGame, getGameResources } from '@/services/gameService';
import { Food as FoodType, FoodItem, Difficulty, ResourcesApiResponse, WasteStats } from '../../interfaces';
import { playSound } from '../../utils/soundEffects';
import { getConveyorSpeed, getFoodGenerationInterval, isInZone } from '../../utils/gameLogic';
import Head from 'next/head';

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
  handleGameOver: (wasteStats: WasteStats) => Promise<void>;
  gameResources: ResourcesApiResponse | null;
}

// Define proper types for the conveyor segment
interface ConveyorSegment {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  direction: 'right' | 'down' | 'left' | 'up';
}

// Define proper types for event handlers
type TouchEventHandler = (event: TouchEvent) => void;
type KeyboardEventHandler = (event: KeyboardEvent) => void;
type ResizeEventHandler = () => void;


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
  handleGameOver,
  gameResources
}: GameAreaProps) {
  // Game state
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 200, y: 300 });
  const [holdingFood, setHoldingFood] = useState<FoodType | null>(null);
  const [foods, setFoods] = useState<FoodType[]>([]);
  const [diyCooldown, setDiyCooldown] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false);
  const [lastActionTime, setLastActionTime] = useState<number>(0);
  const [wasteStats, setWasteStats] = useState<WasteStats>({
    wastedFoods: {},
    totalWasted: 0
  });
  
  // Character animation state
  const [characterDirection, setCharacterDirection] = useState<'front' | 'back' | 'left' | 'right'>('front');
  const [isCharacterMoving, setIsCharacterMoving] = useState<boolean>(false);
  const [lastMoveTime, setLastMoveTime] = useState<number>(0);
  
  // Game resources state - use the passed gameResources instead of loading again
  const [isLoadingResources, setIsLoadingResources] = useState<boolean>(false);
  
  // Refs
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  // Constants
  const characterSize = 60;
  const foodSize = 40;
  const moveSpeed = 10;
  const diyCooldownTime = 5; // 5 seconds cooldown

  // Define the conveyor segments with useMemo to prevent recreating on each render
  const conveyorSegments = React.useMemo(() => [
    { 
      id: 'top', 
      start: { x: 50, y: 265 }, // Starting from left side of top segment with offset
      end: { x: 1000, y: 265 },  // End at right side of top segment
      direction: 'right' as const
    },
    { 
      id: 'right', 
      start: { x: 1000, y: 265 }, // Right side going down
      end: { x: 1000, y: 450 },   // To bottom right corner
      direction: 'down' as const
    },
    // No left vertical segment - food resets to start after bottom segment
  ], []);

  // Add a state for prepared game food items
  const [gameFoodItems, setGameFoodItems] = useState<FoodItem[]>([]);
  
  // Remove duplicate game resources loading
  // Load game resources when component mounts
  // And prepare balanced food items when component mounts
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
          foodType = 'food bank';
        }
        
        // Start food at the beginning of the top segment
        const startSegment = conveyorSegments[0];
        
        const newFood: FoodType = {
          id: Date.now(),
          type: foodType,
          x: startSegment.start.x,
          y: startSegment.start.y,
          name: randomFoodType.name,
          image: randomFoodType.image,
          segment: 0,  // Track which segment the food is on
          diy_option: String(randomFoodType.diy_option) === '1',
          greengas_emession: randomFoodType.greengas_emession  // Include greenhouse gas emission data
        };
        
        setFoods(prev => [...prev, newFood]);
      }
    }, difficulty === 'easy' ? 4000 : difficulty === 'normal' ? 3000 : 2000);

    return () => clearInterval(interval);
  }, [gameId, gameFoodItems, difficulty, foods.length, conveyorSegments]);

  // Helper function to track wasted food
  const trackWastedFood = useCallback((food: FoodType) => {
    if (food.type === 'trash') return; // Don't track trash items

    // Log the food object to verify if greengas_emession exists
    console.log('Tracking wasted food with data:', food);

    setWasteStats(prev => {
      const newWastedFoods = { ...prev.wastedFoods };
      if (!newWastedFoods[food.name]) {
        // Initialize the wasted food entry with all available properties
        newWastedFoods[food.name] = { 
          name: food.name, 
          count: 0,
          greengas_emession: food.greengas_emession
        };
      }
      newWastedFoods[food.name].count++;

      return {
        wastedFoods: newWastedFoods,
        totalWasted: prev.totalWasted + 1
      };
    });
  }, []);

  // Update the food movement effect to track wasted food
  useEffect(() => {
    if (!gameId) return;
    
    const moveInterval = setInterval(() => {
      const currentSpeed = getConveyorSpeed(difficulty);
      
      setFoods(prevFoods => {
        const newFoods: FoodType[] = [];
        
        for (const food of prevFoods) {
          const segment = food.segment !== undefined ? food.segment : 0;
          const currentSegment = conveyorSegments[segment];
          
          let keepFood = true;
          
          switch (currentSegment.direction) {
            case 'right':
              food.x += currentSpeed;
              if (food.x >= currentSegment.end.x) {
                food.x = conveyorSegments[segment + 1].start.x;
                food.y = conveyorSegments[segment + 1].start.y;
                food.segment = segment + 1;
              }
              break;
            case 'down':
              food.y += currentSpeed;
              if (food.y >= currentSegment.end.y) {
                if (gameId && food.type !== 'trash') {
                  updateGame(gameId, 'incorrect', food.type)
                    .then(response => {
                      setScore(response.score);
                      playSound('wasteFood');
                      showMessage('-5 points. Food wasted!', 'error');
                      trackWastedFood(food);
                    })
                    .catch(error => console.error('Failed to update score:', error));
                  keepFood = false;
                } else if (food.type === 'trash') {
                  keepFood = false;
                  showMessage('Good! Trash disposed properly!', 'success');
                } else {
                  food.x = conveyorSegments[0].start.x;
                  food.y = conveyorSegments[0].start.y;
                  food.segment = 0;
                }
              }
              break;
          }
          
          if (keepFood) {
            newFoods.push(food);
          }
        }
        
        return newFoods;
      });
    }, 50);
    
    return () => clearInterval(moveInterval);
  }, [gameId, difficulty, trackWastedFood]);

  // Game timer
  useEffect(() => {
    if (!gameId) return;
    
    const timer = setInterval(async () => {
      if (time <= 1) {
        clearInterval(timer);
        handleGameOver(wasteStats);
        setTime(0);
      } else {
        setTime(time - 1);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameId, setTime, handleGameOver, time, wasteStats]);

  // DIY cooldown timer
  useEffect(() => {
    if (diyCooldown <= 0) return;
    
    const cooldownTimer = setInterval(() => {
      setDiyCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(cooldownTimer);
  }, [diyCooldown]);

  useEffect(() => {
    const autoStopMoving = () => {
      if (isCharacterMoving && Date.now() - lastMoveTime > 150) {
        setIsCharacterMoving(false);
      }
    };
    
    const interval = setInterval(autoStopMoving, 200);
    return () => clearInterval(interval);
  }, [isCharacterMoving, lastMoveTime]);

  // Handle action (dropping food in zones)
  const handleAction = useCallback(async () => {
    if (!holdingFood || !gameId) return;
    
    const foodBankZone = { x: 300, y: 350, width: 150, height: 150 };
    const greenBinZone = { x: 500, y: 350, width: 150, height: 150 }; 
    const diyZone = { x: 700, y: 350, width: 150, height: 150 };
    
    const playerCenterX = position.x + characterSize / 2;
    const playerCenterY = position.y + characterSize / 2;
    
    const inFoodBankZone = isInZone(playerCenterX, playerCenterY, foodBankZone.x, foodBankZone.y, foodBankZone.width, foodBankZone.height);
    const inGreenBinZone = isInZone(playerCenterX, playerCenterY, greenBinZone.x, greenBinZone.y, greenBinZone.width, greenBinZone.height);
    const inDiyZone = isInZone(playerCenterX, playerCenterY, diyZone.x, greenBinZone.y, diyZone.width, diyZone.height);
    
    if (!inFoodBankZone && !inGreenBinZone && !inDiyZone) {
        return;
    }
    
    let actionType = 'incorrect';
    let successMessage = '';
    let scoreChange = 0;
    let isWrongAction = false;
    
    if (inFoodBankZone) {
        if (holdingFood.type === 'food bank') {
            actionType = 'correct';
            scoreChange = 10;
            successMessage = 'Great job! Food donated!';
        } else {
            scoreChange = -5;
            successMessage = 'Wrong zone! This food cannot be donated.';
            isWrongAction = true;
        }
    } else if (inGreenBinZone) {
        if (holdingFood.type === 'green waste bin') {
            actionType = 'correct';
            scoreChange = 10;
            successMessage = 'Great job! Food composted!';
        } else {
            scoreChange = -5;
            successMessage = 'Wrong zone! This food cannot be composted.';
            isWrongAction = true;
        }
    } else if (inDiyZone) {
        if (holdingFood.diy_option) {
            actionType = 'correct';
            scoreChange = 15;
            successMessage = 'Amazing! You made something new!';
        } else {
            scoreChange = -5;
            successMessage = 'Wrong zone! This food cannot be used for DIY.';
            isWrongAction = true;
        }
    }
    
    try {
        const diyOption = holdingFood ? (holdingFood.diy_option ? '1' : '0') : undefined;
        const response = await updateGame(gameId, actionType, holdingFood.type, diyOption);
        setScore(response.score);
        
        const formattedMessage = `${scoreChange >= 0 ? '+' : ''}${scoreChange} points. ${successMessage}`;
        
        if (actionType === 'correct') {
            playSound('donate');
            showMessage(formattedMessage, 'success');
        } else {
            playSound('wrongAction');
            showMessage(formattedMessage, 'error');
            if (isWrongAction) {
                trackWastedFood(holdingFood);
            }
        }
    } catch (error) {
        console.error('Failed to update score:', error);
    } finally {
        setHoldingFood(null);
    }
  }, [holdingFood, gameId, position, trackWastedFood]);

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
        // Using an IIFE to avoid circular dependency
        (async () => {
          await handleAction();
          setIsActionInProgress(false);
        })();
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
          // No sound for pickup
        }
      }
    } finally {
      if (!holdingFood) {
        setIsActionInProgress(false);
      }
    }
  }, [foods, holdingFood, position, lastActionTime, isActionInProgress, handleAction]);

  // Add keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const gameAreaWidth = gameAreaRef.current?.clientWidth ?? 800;
      const gameAreaHeight = gameAreaRef.current?.clientHeight ?? 600;
      
      setIsCharacterMoving(true);
      setLastMoveTime(Date.now());
      
      // Movement controls (WASD)
      setPosition(prev => {
          let newX = prev.x;
          let newY = prev.y;
          
          // Horizontal movement
          if (key === 'a' || key === 'arrowleft') {
              newX = Math.max(0, prev.x - moveSpeed);
              setCharacterDirection('left');
          } else if (key === 'd' || key === 'arrowright') {
              newX = Math.min(gameAreaWidth - characterSize, prev.x + moveSpeed);
              setCharacterDirection('right');
          }
          
          // Vertical movement
          if (key === 'w' || key === 'arrowup') {
              newY = Math.max(0, prev.y - moveSpeed);
              setCharacterDirection('front');
          } else if (key === 's' || key === 'arrowdown') {
              newY = Math.min(gameAreaHeight - characterSize, prev.y + moveSpeed);
              setCharacterDirection('back');
          }
          
          return { x: newX, y: newY };
      });
      
      // Action controls
      if (key === 'q' || key === 'j') {
          handlePickup();
      }
    };
    
    const handleKeyUp = () => {
        setIsCharacterMoving(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [foods, holdingFood, position, handlePickup, moveSpeed]);

  // Remove debug useEffect for resource values
  useEffect(() => {
    // Update conveyor segments
    const segments = conveyorSegments;
    // ... rest of the effect code ...
  }, [conveyorSegments]);

  // Game configuration
  const gameSpeed = getConveyorSpeed(difficulty);
  const foodGenerationInterval = getFoodGenerationInterval(difficulty);

  return (
    <>
      <Head>
        <title>Food Waste Game - Playing</title>
      </Head>
      <div className="bg-white bg-opacity-60 backdrop-filter backdrop-blur-sm rounded-lg shadow-xl overflow-hidden">
        {/* Score Display */}
        <ScoreBoard score={score} time={time} />
        
        {/* Game Area */}
        <div
          ref={gameAreaRef}
          className="relative w-full overflow-hidden"
          style={{
            backgroundImage: gameResources?.specificResources?.map1?.image 
              ? `url(${gameResources?.specificResources?.map1?.image})` 
              : 'linear-gradient(to bottom, #e0f7fa, #b2ebf2)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            touchAction: 'none',
            height: '600px',
            width: '100%'
          }}
        >
          {/* Conveyor belt */}
          <ConveyorBelt resources={gameResources} />
          
          {/* Drop zones */}
          <DropZones 
            diyCooldown={diyCooldown} 
            foodBankImage={gameResources?.specificResources?.foodbank?.image}
            greenBinImage={gameResources?.specificResources?.greenbin?.image}
            diyImage={gameResources?.specificResources?.diy?.image}
          />
          
          {gameResources?.specificResources?.landfill?.image && (
            <div className="absolute bottom-16 right-16 w-20 h-20">
              <img 
                src={gameResources.specificResources.landfill.image} 
                alt="Landfill" 
                className="max-w-full max-h-full object-contain opacity-80"
              />
            </div>
          )}

          {gameResources?.specificResources?.bush?.image && (
            <div className="absolute bottom-16 left-16 w-20 h-20">
              <img 
                src={gameResources.specificResources.bush.image} 
                alt="Bush" 
                className="max-w-full max-h-full object-contain opacity-80"
              />
            </div>
          )}
          
          {/* Foods on conveyor belt */}
          <Food foods={foods} foodSize={foodSize} />
          
          {/* Character */}
          <Character 
            position={position} 
            characterSize={characterSize} 
            holdingFood={holdingFood}
            direction={characterDirection}
            isMoving={isCharacterMoving}
            spriteResources={{
              front_player: gameResources?.resources?.find(r => r.name.toLowerCase() === 'front_player')?.image,
              back_player: gameResources?.resources?.find(r => r.name.toLowerCase() === 'back_player')?.image,
              left_player: gameResources?.resources?.find(r => r.name.toLowerCase() === 'left_player')?.image,
              right_player: gameResources?.resources?.find(r => r.name.toLowerCase() === 'right_player')?.image
            }}
          />
          
          {/* Message display */}
          <MessageDisplay message={message} messageType={messageType} />
        </div>
      </div>
    </>
  );
} 