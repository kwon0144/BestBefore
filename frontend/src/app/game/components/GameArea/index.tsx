/**
 * GameArea Component
 * Main gameplay area that renders the game interface and manages game logic
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { updateGame, getGameResources } from '@/services/gameService';
import { Food as FoodType, FoodItem, Difficulty, ResourcesApiResponse, WasteStats } from '../../interfaces';
import { playSound } from '../../utils/soundEffects';
import { getConveyorSpeed, getFoodGenerationInterval, isInZone } from '../../utils/gameLogic';
import useIsMobile from '../../hooks/useIsMobile';
import Head from 'next/head';

// Sub-components
import ScoreBoard from './ScoreBoard';
import ConveyorBelt from './ConveyorBelt';
import Character from './Character';
import DropZones from './DropZones';
import Food from './Food';
import MessageDisplay from './MessageDisplay';
import FullscreenButton from './FullscreenButton';
import MobileControls from './MobileControls';

interface GameAreaProps {
  gameId: string | null;
  score: number;
  setScore: (score: number) => void;
  time: number;
  setTime: (time: number) => void;
  difficulty: Difficulty;
  foodItems: FoodItem[];
  handleGameOver: (wasteStats: WasteStats) => Promise<void>;
}

// Add a new interface for tracking food movement on the conveyor
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ConveyorSegment {
  id: string;
  start: { x: number, y: number };
  end: { x: number, y: number };
  direction: 'right' | 'down' | 'left' | 'up';
}

// Update the requestFullscreen function
const requestFullscreen = async () => {
  try {
    // Check if we're on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (!isIOS) {
      // For non-iOS devices, try standard methods
      const docElem = document.documentElement;
      
      if (docElem.requestFullscreen) {
        await docElem.requestFullscreen();
        return true;
      }
      
      if ((docElem as any).webkitRequestFullscreen) {
        await (docElem as any).webkitRequestFullscreen();
        return true;
      }
      
      if ((docElem as any).mozRequestFullScreen) {
        await (docElem as any).mozRequestFullScreen();
        return true;
      }
      
      if ((docElem as any).msRequestFullscreen) {
        await (docElem as any).msRequestFullscreen();
        return true;
      }
    } else {
      // iOS-specific approach
      const videoElem = document.createElement('video');
      videoElem.style.width = '100%';
      videoElem.style.height = '100%';
      videoElem.style.position = 'fixed';
      videoElem.style.top = '0';
      videoElem.style.left = '0';
      videoElem.style.zIndex = '1000';
      videoElem.playsInline = true;
      videoElem.muted = true;
      videoElem.autoplay = true;
      videoElem.controls = false;
      
      // Use a short video source
      videoElem.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAs1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0MiByMjQ3OSBkZDc5YTYxIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNCAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PWluZmluaXRlIGtleWludF9taW49Mjkgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD00MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIzLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAAAAwZYiEAD//8W/xoUjEe1H4KFEeT/ySFgH9X+ghBxhqN3B1YmxpYyBkb21haW4gZHVtbXkK';
      
      // Add to body temporarily
      document.body.appendChild(videoElem);
      
      try {
        // Wait for video to be loaded
        await new Promise((resolve) => {
          videoElem.addEventListener('loadedmetadata', resolve, { once: true });
          videoElem.addEventListener('error', resolve, { once: true });
        });
        
        // Try to play the video first (required for iOS)
        await videoElem.play();
        
        // Now try to enter fullscreen
        if ((videoElem as any).webkitEnterFullscreen) {
          await (videoElem as any).webkitEnterFullscreen();
          return true;
        }
      } catch (e) {
        console.warn('iOS video fullscreen failed:', e);
      } finally {
        // Clean up
        videoElem.pause();
        document.body.removeChild(videoElem);
      }
    }
    
    // If all else fails, try one last fallback
    const elem = document.body;
    if ((elem as any).webkitRequestFullscreen) {
      await (elem as any).webkitRequestFullscreen();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Fullscreen request failed:', error);
    return false;
  }
};

// Add this near the top of the component
const isFullscreenMode = () => {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement ||
    (document as any).webkitIsFullScreen ||
    (window.innerHeight === screen.height && window.innerWidth === screen.width)
  );
};

// Add this function before the component
const setFullscreenMetaTag = (enable: boolean) => {
  // Get or create the viewport meta tag
  let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }
  
  if (enable) {
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, minimal-ui';
    // Add iOS specific meta tags
    let webappCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]') as HTMLMetaElement;
    if (!webappCapable) {
      webappCapable = document.createElement('meta');
      webappCapable.setAttribute('name', 'apple-mobile-web-app-capable');
      webappCapable.setAttribute('content', 'yes');
      document.head.appendChild(webappCapable);
    }
  } else {
    viewport.content = 'width=device-width, initial-scale=1.0';
  }
};

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
  const [wasteStats, setWasteStats] = useState<WasteStats>({
    wastedFoods: {},
    totalWasted: 0
  });
  
  // Character animation state
  const [characterDirection, setCharacterDirection] = useState<'front' | 'back' | 'left' | 'right'>('front');
  const [isCharacterMoving, setIsCharacterMoving] = useState<boolean>(false);
  const [lastMoveTime, setLastMoveTime] = useState<number>(0);
  
  // Game resources state
  const [gameResources, setGameResources] = useState<ResourcesApiResponse>({ status: '', count: 0, resources: [] });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoadingResources, setIsLoadingResources] = useState<boolean>(true);
  
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
  
  // Load game resources when component mounts
  useEffect(() => {
    async function loadGameResources() {
      try {
        setIsLoadingResources(true);
        const resourcesData = await getGameResources();
        setGameResources(resourcesData);
        console.log('Loaded game resources:', resourcesData);
      } catch (error) {
        console.error('Failed to load game resources:', error);
      } finally {
        setIsLoadingResources(false);
      }
    }
    
    loadGameResources();
  }, []);
  
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
        
        const newFood: FoodType = {
          id: Date.now(),
          type: foodType,
          x: startSegment.start.x,
          y: startSegment.start.y,
          name: randomFoodType.name,
          image: randomFoodType.image,
          segment: 0,  // Track which segment the food is on
          diy_option: String(randomFoodType.diy_option) === '1'  
        };
        
        // Debug: output converted type
        console.log('Converted food type for game:', newFood.type, 'DIY option:', newFood.diy_option);
        
        setFoods(prevFoods => [...prevFoods, newFood]);
      }
    }, getFoodGenerationInterval(difficulty));
    
    return () => clearInterval(interval);
  }, [gameId, gameFoodItems, foods.length, difficulty]);

  // Helper function to track wasted food
  const trackWastedFood = useCallback((food: FoodType) => {
    if (food.type === 'trash') return; // Don't track trash items

    setWasteStats(prev => {
      const newWastedFoods = { ...prev.wastedFoods };
      if (!newWastedFoods[food.name]) {
        newWastedFoods[food.name] = { name: food.name, count: 0 };
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
        console.log('Not in a valid drop zone, still holding food');
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
        console.log('Attempting to drop food:', holdingFood.name, holdingFood.type);
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
          console.log('Picking up food:', pickedFood.name, pickedFood.type);
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

  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenAttempted, setFullscreenAttempted] = useState(false);

  // Handle fullscreen request
  const handleFullscreenRequest = async () => {
    setFullscreenAttempted(true);
    try {
      // First try to detect if we're on iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      
      // For iOS, show specific instructions
      if (isIOS) {
        showMessage('Tap the screen once, then tap the fullscreen button in your browser', 'error');
        // Add a temporary interaction handler
        const handleTouch = () => {
          document.removeEventListener('touchend', handleTouch);
          requestFullscreen().then(success => {
            if (success) {
              setIsFullscreen(true);
            }
          });
        };
        document.addEventListener('touchend', handleTouch, { once: true });
        return;
      }
      
      // For non-iOS devices
      const success = await requestFullscreen();
      if (success) {
        setIsFullscreen(true);
      } else {
        showMessage('Unable to enter fullscreen. Try rotating your device to landscape.', 'error');
      }
    } catch (error) {
      console.error('Fullscreen request error:', error);
      showMessage('Failed to enter fullscreen mode. Please try again.', 'error');
    }
  };

  // Update the fullscreen effect
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenNow = isFullscreenMode();
      console.log('Fullscreen state changed:', fullscreenNow);
      setIsFullscreen(fullscreenNow);
    };

    // Check initial state
    setIsFullscreen(isFullscreenMode());

    // Add event listeners for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Also check on orientation and resize changes
    const handleResize = () => {
      const fullscreenNow = isFullscreenMode();
      console.log('Window resized, fullscreen:', fullscreenNow);
      setIsFullscreen(fullscreenNow);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Handle mobile direction press
  const handleMobileDirectionPress = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const gameAreaWidth = gameAreaRef.current?.clientWidth ?? 800;
    const gameAreaHeight = gameAreaRef.current?.clientHeight ?? 600;
    
    setIsCharacterMoving(true);
    setLastMoveTime(Date.now());
    
    setPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;
      
      switch (direction) {
        case 'left':
          newX = Math.max(0, prev.x - moveSpeed);
          setCharacterDirection('left');
          break;
        case 'right':
          newX = Math.min(gameAreaWidth - characterSize, prev.x + moveSpeed);
          setCharacterDirection('right');
          break;
        case 'up':
          newY = Math.max(0, prev.y - moveSpeed);
          setCharacterDirection('front');
          break;
        case 'down':
          newY = Math.min(gameAreaHeight - characterSize, prev.y + moveSpeed);
          setCharacterDirection('back');
          break;
      }
      
      return { x: newX, y: newY };
    });
  }, [moveSpeed, characterSize]);

  // Handle mobile direction release
  const handleMobileDirectionRelease = useCallback(() => {
    setIsCharacterMoving(false);
  }, []);

  // Only add keyboard controls if not on mobile
  useEffect(() => {
    if (isMobile) return;

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
  }, [isMobile, foods, holdingFood, position, handlePickup, moveSpeed]);

  // Add a useEffect to debug resource values
  useEffect(() => {
    if (Object.keys(gameResources).length > 0 && gameResources.resources) {
      // Find the resources by name directly from the resources array
      const findResourceByName = (name: string) => {
        const lowerName = name.toLowerCase();
        return gameResources.resources.find(
          r => r.name.toLowerCase() === lowerName || 
               r.name.toLowerCase().includes(lowerName)
        );
      };
      
      const foodBankResource = findResourceByName('food bank');
      const greenBinResource = findResourceByName('green waste bin') || 
                               findResourceByName('green bin') || 
                               findResourceByName('compost bin');
      const diyResource = findResourceByName('diy') || findResourceByName('diy place');
      
      const frontPlayerResource = findResourceByName('front_player');
      const backPlayerResource = findResourceByName('back_player');
      const leftPlayerResource = findResourceByName('left_player');
      const rightPlayerResource = findResourceByName('right_player');
      
      console.log('Found food bank resource:', foodBankResource);
      console.log('Found green bin resource:', greenBinResource);
      console.log('Found DIY resource:', diyResource);
      console.log('Found character sprite resources:', {
        front: frontPlayerResource,
        back: backPlayerResource,
        left: leftPlayerResource,
        right: rightPlayerResource
      });
      
      console.log('Specific resources:', gameResources.specificResources);
    }
  }, [gameResources]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, minimal-ui" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Score Display */}
        <ScoreBoard score={score} time={time} />
        
        {/* Game Area */}
        <div
          ref={gameAreaRef}
          className="relative w-full overflow-hidden"
          style={{
            backgroundImage: gameResources.specificResources?.background?.image 
              ? `url(${gameResources.specificResources.background.image})` 
              : 'linear-gradient(to bottom, #e0f7fa, #b2ebf2)',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            touchAction: 'none',
            height: isMobile 
              ? isFullscreen 
                ? '100dvh' // Use dynamic viewport height
                : '100dvh'
              : '600px',
            width: isMobile ? '100dvw' : '100%', // Use dynamic viewport width
            position: isMobile ? 'fixed' : 'relative',
            top: isMobile ? '0' : 'auto',
            left: isMobile ? '0' : 'auto',
            zIndex: isMobile ? '50' : 'auto'
          }}
        >
          {/* Conveyor belt */}
          <ConveyorBelt resources={gameResources} />
          
          {/* Drop zones */}
          <DropZones 
            diyCooldown={diyCooldown} 
            foodBankImage={gameResources.specificResources?.foodbank?.image}
            greenBinImage={gameResources.specificResources?.greenbin?.image}
            diyImage={gameResources.specificResources?.diy?.image}
          />
          
          {gameResources.specificResources?.landfill?.image && (
            <div className="absolute bottom-16 right-16 w-20 h-20">
              <img 
                src={gameResources.specificResources.landfill.image} 
                alt="Landfill" 
                className="max-w-full max-h-full object-contain opacity-80"
              />
            </div>
          )}

          {gameResources.specificResources?.bush?.image && (
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
              front_player: gameResources.resources?.find(r => r.name.toLowerCase() === 'front_player')?.image,
              back_player: gameResources.resources?.find(r => r.name.toLowerCase() === 'back_player')?.image,
              left_player: gameResources.resources?.find(r => r.name.toLowerCase() === 'left_player')?.image,
              right_player: gameResources.resources?.find(r => r.name.toLowerCase() === 'right_player')?.image
            }}
          />
          
          {/* Message display */}
          <MessageDisplay message={message} messageType={messageType} />
          
          {/* Mobile Controls */}
          {isMobile && isFullscreen && (
            <MobileControls
              onDirectionPress={handleMobileDirectionPress}
              onDirectionRelease={handleMobileDirectionRelease}
              onPickupPress={handlePickup}
            />
          )}
          
          {/* Fullscreen overlay for mobile */}
          {isMobile && (!isFullscreen || window.innerWidth < window.innerHeight) && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-[9999] p-4"
              style={{ 
                height: '100dvh',
                width: '100dvw',
                position: 'fixed',
                top: 0,
                left: 0
              }}
            >
              <h2 className="text-white text-2xl font-bold mb-4 text-center">
                {window.innerWidth < window.innerHeight 
                  ? "Please Rotate Your Device" 
                  : "Please Play in Fullscreen"}
              </h2>
              
              {/* Rotation indicator */}
              {window.innerWidth < window.innerHeight && (
                <div className="animate-pulse mb-4">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              )}
              
              <div className="flex flex-col items-center gap-4">
                {window.innerWidth > window.innerHeight ? (
                  <button
                    onClick={() => {
                      console.log('Starting game in fullscreen-like mode');
                      setFullscreenMetaTag(true);
                      // Force reflow
                      window.scrollTo(0, 0);
                      document.body.style.overflow = 'hidden';
                      document.body.style.position = 'fixed';
                      document.body.style.width = '100%';
                      document.body.style.height = '100%';
                      
                      // Set timeout to ensure styles are applied
                      setTimeout(() => {
                        setIsFullscreen(true);
                      }, 100);
                    }}
                    className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-xl shadow-lg transform transition hover:scale-105 active:scale-95"
                  >
                    Start Game
                  </button>
                ) : (
                  <div className="animate-pulse text-white text-center">
                    <p className="mb-4">Please rotate your device</p>
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                )}

                {/* Debug information */}
                <div className="text-white text-sm mt-4 text-center opacity-50">
                  <p>Device: {/iPad|iPhone|iPod/.test(navigator.userAgent) ? 'iOS' : 'Other'}</p>
                  <p>Orientation: {window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait'}</p>
                  <p>Screen: {window.innerWidth}x{window.innerHeight}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 