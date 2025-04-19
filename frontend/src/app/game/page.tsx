"use client";

// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState, useEffect, useRef } from 'react';
import { startGame, updateGame, endGame, getLeaderboard } from '@/services/gameService';
import axios from "axios";
import { config } from "@/config";
import Title from "../(components)/Title";
import { Button } from "@heroui/react";

// Sound effects
let sounds: { [key: string]: HTMLAudioElement } = {};
const playSound = (type: 'donate' | 'eatFood' | 'gameStart' | 'wasteFood' | 'wrongAction') => {
  if (typeof window !== 'undefined' && sounds[type]) {
    try {
      // Create a new instance of the audio to avoid overlapping playback issues
      const sound = new Audio(sounds[type].src);
      sound.volume = 0.5; // Set volume to 50%
      
      // Add event listeners for debugging
      sound.addEventListener('play', () => console.log(`Sound ${type} started playing`));
      sound.addEventListener('error', (e) => console.error(`Sound ${type} error:`, e));
      
      // Force play with user interaction
      const playPromise = sound.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => console.log(`Audio play failed for ${type}:`, err));
      }
    } catch (err) {
      console.log('Sound playback error:', err);
    }
  } else {
    console.log(`Sound ${type} not available`);
  }
};

// Initialize sounds in useEffect to ensure it only runs in the browser
const App: React.FC = () => {
  // Add a state to track if sounds are loaded
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Initializing sounds...');
      
      // Pre-load sound files with the specific URLs provided
      const soundUrls = {
        donate: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/donate.wav',
        eatFood: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/eatFood.wav',
        gameStart: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/gameStart.wav',
        wasteFood: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/wasteFodd.wav',
        wrongAction: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/wrongAction.wav'
      };
      
      // Create audio objects
      sounds = {};
      
      // Load each sound and track loading status
      let loadedCount = 0;
      const totalSounds = Object.keys(soundUrls).length;
      
      Object.entries(soundUrls).forEach(([key, url]) => {
        const audio = new Audio();
        
        // Add event listeners for loading
        audio.addEventListener('canplaythrough', () => {
          console.log(`Sound ${key} loaded successfully`);
          loadedCount++;
          if (loadedCount === totalSounds) {
            console.log('All sounds loaded successfully');
            setSoundsLoaded(true);
          }
        });
        
        audio.addEventListener('error', (e) => {
          console.error(`Error loading sound ${key}:`, e);
        });
        
        // Set source and load
        audio.src = url;
        audio.volume = 0.5;
        audio.load();
        
        sounds[key] = audio;
      });
    }
  }, []);

  // Add useEffect to fetch food items
  useEffect(() => {
    fetchFoodItems();
  }, []);

  const [score, setScore] = useState<number>(0);
  const [time, setTime] = useState<number>(60);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [position, setPosition] = useState({ x: 200, y: 300 });
  const [holdingFood, setHoldingFood] = useState<Food | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [eatingCooldown, setEatingCooldown] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const characterSize = 60;
  const foodSize = 40;
  const moveSpeed = 10;
  const conveyorSpeed = 2;
  const eatingCooldownTime = 5; // 5 seconds cooldown
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false);
  const [lastActionTime, setLastActionTime] = useState<number>(0);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreGame, setShowPreGame] = useState(true);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');

  interface Food {
    id: number;
    type: 'donate' | 'compost' | 'eat' | 'trash' | 'foodbank' | 'greenbin' | 'both';
    x: number;
    y: number;
    name: string;
    image: string;
  }

  interface FoodItem {
    id: number;
    name: string;
    type: string;
    image: string;
    description: string;
  }

  interface ApiResponse {
    food_items: FoodItem[];
    count: number;
  }

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(`${config.apiUrl}/api/game/food-items/`);
      setFoodItems(response.data.food_items);
      setError(null);
    } catch (err) {
      setError('Failed to fetch food items');
      console.error('Error fetching food items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Modify conveyor speed based on difficulty
  const getConveyorSpeed = () => {
    switch (difficulty) {
      case 'easy': return 1;
      case 'normal': return 1.5;
      case 'hard': return 2;
      default: return 1.5;
    }
  };

  // Start the game
  const handleStartGame = async () => {
    if (showPreGame) {
      setShowPreGame(false);
      return;
    }

    if (window.confirm('Ready to start? Remember:\n- Use WASD to move\n- Press Q to pick up/drop food\n- Press E to eat suitable food')) {
      try {
        const demoPlayerId = 'demo-player-1';
        setPlayerId(demoPlayerId);
        const gameData = await startGame(demoPlayerId);
        setGameId(gameData.game_id);
        setGameStarted(true);
        setGameOver(false);
        setScore(gameData.score);
        setTime(gameData.time_remaining);
        setFoods([]);
        setHoldingFood(null);
        setPosition({ x: 200, y: 300 });
        
        // Play game start sound
        if (soundsLoaded) {
          console.log('Playing game start sound');
          playSound('gameStart');
        } else {
          console.log('Sounds not loaded yet, skipping game start sound');
        }
      } catch (error) {
        console.error('Failed to start game:', error);
        alert('Failed to start game. Please try again.');
      }
    }
  };

  // Get interval based on difficulty
  const getFoodGenerationInterval = () => {
    switch (difficulty) {
      case 'easy': return 4000; // 4 seconds
      case 'normal': return 3500; // 3.5 seconds
      case 'hard': return 3000; // 3 seconds
      default: return 3500;
    }
  };

  // Generate food on the conveyor belt
  useEffect(() => {
    if (!gameStarted || gameOver || loading || foodItems.length === 0) return;

    const interval = setInterval(() => {
      if (foods.length < 5) {
        const randomFoodType = foodItems[Math.floor(Math.random() * foodItems.length)];
        const newFood: Food = {
          id: Date.now(),
          type: randomFoodType.type as 'donate' | 'compost' | 'eat' | 'trash' | 'foodbank' | 'greenbin' | 'both',
          x: -foodSize,
          y: 100 - foodSize / 2,
          name: randomFoodType.name,
          image: randomFoodType.image
        };
        setFoods(prevFoods => [...prevFoods, newFood]);
      }
    }, getFoodGenerationInterval());
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, loading, foodItems, difficulty]);

  // Move food on the conveyor belt
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const moveInterval = setInterval(() => {
      const gameAreaWidth = gameAreaRef.current?.getBoundingClientRect().width ?? 800;
      const currentSpeed = getConveyorSpeed();
      
      setFoods(prevFoods => {
        const newFoods = prevFoods.filter(food => {
          const newX = food.x + currentSpeed;
          if (newX >= gameAreaWidth) {
            // Handle food waste scoring
            if (gameId && food.type !== 'trash') {
              updateGame(gameId, 'incorrect', food.type)
                .then(response => {
                  setScore(response.score);
                  setTime(response.time_remaining);
                  if (soundsLoaded) {
                    console.log('Playing waste food sound');
                    playSound('wasteFood');
                  }
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
  }, [gameStarted, gameOver, gameId, difficulty, soundsLoaded]);

  // Game timer
  useEffect(() => {
    if (!gameStarted || gameOver || !gameId) return;
    const timer = setInterval(async () => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleGameOver();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameOver, gameId]);

  // Eating cooldown timer
  useEffect(() => {
    if (eatingCooldown <= 0) return;
    const cooldownTimer = setInterval(() => {
      setEatingCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownTimer);
  }, [eatingCooldown]);

  // Message display timer
  useEffect(() => {
    if (!message) return;
    const messageTimer = setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 2000);
    return () => clearTimeout(messageTimer);
  }, [message]);

  // Handle pickup
  const handlePickup = () => {
    if (holdingFood) return;
    
    // Get the current foods from the state
    const currentFoods = [...foods];
    
    const characterCenterX = position.x + characterSize / 2;
    const characterCenterY = position.y + characterSize / 2;
    
    // Find the closest food
    let closestFood = null;
    let minDistance = Infinity;
    
    for (const food of currentFoods) {
      const foodCenterX = food.x + foodSize / 2;
      const foodCenterY = food.y + foodSize / 2;
      const distance = Math.sqrt(
        Math.pow(characterCenterX - foodCenterX, 2) +
        Math.pow(characterCenterY - foodCenterY, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestFood = food;
      }
    }
    
    // If the closest food is within pickup range, pick it up
    if (closestFood && minDistance < (characterSize / 2 + foodSize / 2)) {
      setHoldingFood(closestFood);
      setFoods(prevFoods => prevFoods.filter(food => food.id !== closestFood.id));
      // Removed pickup sound as requested
    }
  };

  // Handle action (placing food)
  const handleAction = async () => {
    if (isActionInProgress) {
      return;
    }
    
    if (!holdingFood || !gameId) {
      return;
    }

    setIsActionInProgress(true);
    
    try {
      const characterCenterX = position.x + characterSize / 2;
      const characterCenterY = position.y + characterSize / 2;

      // Check if character is in the food bank zone
      if (characterCenterX > 250 && characterCenterX < 400 && characterCenterY > 400) {
        const isCorrect = holdingFood.type === 'foodbank' || holdingFood.type === 'both';
        const response = await updateGame(gameId, isCorrect ? 'correct' : 'incorrect', holdingFood.type);
        setScore(response.score);
        setTime(response.time_remaining);
        
        if (isCorrect) {
          if (soundsLoaded) {
            console.log('Playing donate sound');
            playSound('donate');
          }
          showMessage('Correct! Food donated. +10 points', 'success');
        } else {
          if (soundsLoaded) {
            console.log('Playing wrong action sound');
            playSound('wrongAction');
          }
          showMessage('Wrong! This food should not be donated. -5 points', 'error');
        }
        setHoldingFood(null);
      }
      // Check if character is in the green bin zone
      else if (characterCenterX > 450 && characterCenterX < 600 && characterCenterY > 400) {
        const isCorrect = holdingFood.type === 'greenbin' || holdingFood.type === 'both';
        const response = await updateGame(gameId, isCorrect ? 'correct' : 'incorrect', holdingFood.type);
        setScore(response.score);
        setTime(response.time_remaining);
        
        if (isCorrect) {
          if (soundsLoaded) {
            console.log('Playing donate sound');
            playSound('donate');
          }
          showMessage('Correct! Food composted. +10 points', 'success');
        } else {
          if (soundsLoaded) {
            console.log('Playing wrong action sound');
            playSound('wrongAction');
          }
          showMessage('Wrong! This food should not be composted. -5 points', 'error');
        }
        setHoldingFood(null);
      }
    } catch (error) {
      console.error('Failed to update game:', error);
      showMessage('Failed to update game state', 'error');
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handle keyboard movement
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const gameAreaRect = gameAreaRef.current?.getBoundingClientRect();
      if (!gameAreaRect) return;
      const maxX = gameAreaRect.width - characterSize;
      const maxY = gameAreaRect.height - characterSize;
      
      // Handle Q key separately
      if (e.key.toLowerCase() === 'q') {
        // Prevent key repeat
        if (e.repeat) {
          return;
        }
        
        // Use debounce mechanism to ensure only one Q key event is processed within a short time
        const now = Date.now();
        if (now - lastActionTime < 300) {
          return; // If less than 300ms since last action, ignore this key press
        }
        setLastActionTime(now);
        
        // Handle pickup or action based on whether holding food
        if (holdingFood) {
          handleAction();
        } else {
          handlePickup();
        }
        return;
      }
      
      // Handle movement and other keys
      setPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;
        switch (e.key.toLowerCase()) {
          case 'w':
            newY = Math.max(0, prev.y - moveSpeed);
            break;
          case 's':
            newY = Math.min(maxY, prev.y + moveSpeed);
            break;
          case 'a':
            newX = Math.max(0, prev.x - moveSpeed);
            break;
          case 'd':
            newX = Math.min(maxX, prev.x + moveSpeed);
            break;
          case 'e': // E key for eating
            if (holdingFood && eatingCooldown === 0) {
              eatFood();
            }
            break;
          default:
            break;
        }
        return { x: newX, y: newY };
      });
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver, holdingFood, eatingCooldown, lastActionTime]);

  // Eat food
  const eatFood = async () => {
    if (!holdingFood || eatingCooldown > 0 || !gameId) return;

    try {
      // Only trash food should be incorrect for eating
      const response = await updateGame(gameId, holdingFood.type === 'trash' ? 'incorrect' : 'correct', holdingFood.type);
      setScore(response.score);
      setTime(response.time_remaining);

      if (holdingFood.type === 'trash') {
        if (soundsLoaded) {
          console.log('Playing wrong action sound');
          playSound('wrongAction');
        }
        showMessage('This is trash! Don\'t eat it! -5 points', 'error');
      } else {
        if (soundsLoaded) {
          console.log('Playing eat food sound');
          playSound('eatFood');
        }
        showMessage('Yum! Food eaten. +10 points', 'success');
      }
      setHoldingFood(null);
      setEatingCooldown(eatingCooldownTime);
    } catch (error) {
      console.error('Failed to update game:', error);
      showMessage('Failed to update game state', 'error');
    }
  };

  // Show message
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
  };

  // Handle game over
  const handleGameOver = async () => {
    if (!gameId) return;

    try {
      const response = await endGame(gameId);
      setGameOver(true);
      setScore(response.score);
      setTime(response.time_played);
    } catch (error) {
      console.error('Failed to end game:', error);
      setGameOver(true);
    }
  };

  // Pre-game information page
  const PreGamePage = () => (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Food Waste Guide</h2>
      
      {/* Food Types Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-green-700 mb-4">Food Types:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-bold text-blue-800">Food Bank Items</h4>
            <p className="text-sm text-blue-600">Non-perishable, sealed, and safe to donate</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-bold text-green-800">Green Bin Items</h4>
            <p className="text-sm text-green-600">Compostable food waste and scraps</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-bold text-yellow-800">Both Types</h4>
            <p className="text-sm text-yellow-600">Can be donated or composted</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-bold text-red-800">Trash Items</h4>
            <p className="text-sm text-red-600">Cannot be eaten, donated, or composted</p>
          </div>
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-green-700 mb-4">Available Food Items:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {foodItems.map(item => (
            <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
              <h4 className="font-bold text-green-800">{item.name}</h4>
              <p className="text-sm text-gray-600">Type: {item.type}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-green-700 mb-4">Select Difficulty:</h3>
        <div className="flex gap-4 justify-center">
          <Button
            onPress={() => setDifficulty('easy')}
            className={`py-2 px-6 rounded-lg ${
              difficulty === 'easy'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-green-600 hover:bg-gray-200'
            }`}
          >
            Easy
          </Button>
          <Button
            onPress={() => setDifficulty('normal')}
            className={`py-2 px-6 rounded-lg ${
              difficulty === 'normal'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-green-600 hover:bg-gray-200'
            }`}
          >
            Normal
          </Button>
          <Button
            onPress={() => setDifficulty('hard')}
            className={`py-2 px-6 rounded-lg ${
              difficulty === 'hard'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-green-600 hover:bg-gray-200'
            }`}
          >
            Hard
          </Button>
        </div>
      </div>

      <Button
        onPress={handleStartGame}
        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
      >
        Start Game
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center py-8">
      <div className="w-full max-w-6xl px-4">
        <h1 className="text-4xl font-bold text-center text-green-800 mb-4">Food Waste Sorting Game</h1>
        <p className="text-lg text-center text-green-700 mb-8">
          Help reduce food waste in Melbourne by correctly sorting food items!
        </p>
        {!gameStarted && !gameOver && showPreGame && <PreGamePage />}
        {!gameStarted && !gameOver && !showPreGame && (
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-green-800 mb-4">How to Play</h2>
            <p className="mb-4 text-gray-700">
              Sort food items by moving your character and pressing F to pick them up from the conveyor belt.
              Place them in the correct destination:
            </p>
            <ul className="mb-6 text-left mx-auto inline-block">
              <li className="flex items-center mb-2">
                <span className="w-6 h-6 bg-blue-500 rounded-full mr-2"></span>
                <span>Food Bank: For edible food that can be donated</span>
              </li>
              <li className="flex items-center mb-2">
                <span className="w-6 h-6 bg-green-500 rounded-full mr-2"></span>
                <span>Green Bin: For food waste that should be composted</span>
              </li>
              <li className="flex items-center mb-2">
                <span className="w-6 h-6 bg-yellow-500 rounded-full mr-2"></span>
                <span>Eat: For food that's best consumed directly (5s cooldown)</span>
              </li>
            </ul>
            <p className="mb-6 text-gray-700">
              <strong>Controls:</strong> WASD to move, Q to pick up/drop food, E to eat food
            </p>
            <button
              onClick={handleStartGame}
              className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 !rounded-button whitespace-nowrap cursor-pointer"
            >
              Start Game
            </button>
          </div>
        )}
        {gameOver && (
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-green-800 mb-4">Game Over!</h2>
            <p className="text-xl mb-4">Your score: <span className="font-bold text-green-600">{score}</span></p>
            <p className="mb-6 text-gray-700">
              {score >= 100
                ? "Great job! You're a food waste sorting expert!"
                : "Keep practicing to improve your food waste sorting skills!"}
            </p>
            <button
              onClick={handleStartGame}
              className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 !rounded-button whitespace-nowrap cursor-pointer"
            >
              Play Again
            </button>
          </div>
        )}
        {gameStarted && !gameOver && (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-green-800 text-white p-4 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">⏱️</span>
                <span className="text-xl font-bold text-yellow-300">{time}s</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">⭐</span>
                <span className="text-xl font-bold text-yellow-300">{score} points</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm mr-2 text-yellow-300">Goal: 100 points</span>
                <div className="w-32 bg-gray-300 rounded-full h-4">
                  <div
                    className="bg-yellow-400 h-4 rounded-full"
                    style={{ width: `${Math.min(100, score)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div
              ref={gameAreaRef}
              className="relative w-full h-[600px] bg-gray-100 overflow-hidden"
            >
              {/* Conveyor belt */}
              <div className="absolute top-[100px] left-0 right-0 h-[50px] bg-gray-400 border-t-2 border-b-2 border-gray-600">
                <div className="h-full w-full flex items-center overflow-hidden">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="h-[10px] w-[40px] bg-gray-600 mx-[20px]"></div>
                  ))}
                </div>
              </div>
              {/* Food Bank */}
              <div className="absolute bottom-[50px] left-[250px] w-[150px] h-[150px] bg-blue-100 border-4 border-blue-500 rounded-lg flex flex-col items-center justify-center">
                <span className="text-blue-500 text-4xl mb-2">🏢</span>
                <span className="font-bold text-blue-700">Food Bank</span>
                <span className="text-sm text-blue-600 mt-1">(Q to donate)</span>
              </div>
              {/* Green Bin */}
              <div className="absolute bottom-[50px] left-[450px] w-[150px] h-[150px] bg-green-100 border-4 border-green-500 rounded-lg flex flex-col items-center justify-center">
                <span className="text-green-500 text-4xl mb-2">♻️</span>
                <span className="font-bold text-green-700">Green Bin</span>
                <span className="text-sm text-green-600 mt-1">(Q to compost)</span>
              </div>
              {/* Eat Button */}
              <div className="absolute top-[250px] right-[50px] w-[150px] h-[80px] bg-yellow-100 border-4 border-yellow-500 rounded-lg flex flex-col items-center justify-center">
                <div className="flex items-center justify-center">
                  <span className="text-yellow-500 text-2xl mr-2">🍽️</span>
                  <span className="font-bold text-yellow-700">Eat (E)</span>
                </div>
                {eatingCooldown > 0 && (
                  <div className="mt-1 text-sm text-yellow-700">
                    Cooldown: {eatingCooldown}s
                  </div>
                )}
              </div>
              {/* Foods on conveyor belt */}
              {foods.map(food => (
                <div
                  key={food.id}
                  className="absolute"
                  style={{
                    left: `${food.x}px`,
                    top: `${food.y}px`,
                    width: `${foodSize}px`,
                    height: `${foodSize}px`
                  }}
                >
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
              {/* Character */}
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
              {/* Message display */}
              {message && (
                <div
                  className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg font-bold ${
                    messageType === 'success' ? 'bg-green-600 text-black' : 'bg-red-600 text-black'
                  }`}
                >
                  {message}
                </div>
              )}
              {/* Food info panel */}
              {time > 57 && (
                <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-md">
                  <h3 className="font-bold text-green-800 mb-2">Food Guide:</h3>
                  <ul className="text-sm">
                    <li className="mb-1 flex items-center">
                      <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      <span>Donate: Sealed, non-perishable items (Space)</span>
                    </li>
                    <li className="mb-1 flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      <span>Compost: Spoiled food, scraps (Space)</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                      <span>Eat: Fresh, ready-to-eat items (E)</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App
