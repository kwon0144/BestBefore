"use client";

// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState, useEffect, useRef } from 'react';
import { startGame, updateGame, endGame, getLeaderboard } from '@/services/gameService';

// Sound effects
let sounds: { [key: string]: HTMLAudioElement } = {};
const playSound = (type: 'success' | 'error' | 'pickup') => {
  if (typeof window !== 'undefined' && sounds[type]) {
    sounds[type].currentTime = 0;
    sounds[type].play().catch(err => console.log('Audio play failed:', err));
  }
};

// Initialize sounds in useEffect to ensure it only runs in the browser
const App: React.FC = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sounds = {
        success: new Audio('/success.mp3'),
        error: new Audio('/error.mp3'),
        pickup: new Audio('/pickup.mp3'),
      };
    }
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
  const foodGenerationInterval = 2000;
  const eatingCooldownTime = 5; // 5 seconds cooldown
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false);
  const [lastActionTime, setLastActionTime] = useState<number>(0);

  interface Food {
    id: number;
    type: 'donate' | 'compost' | 'eat' | 'trash';
    x: number;
    y: number;
    name: string;
    image: string;
  }

  const foodTypes = [
    {
      name: 'Plastic Wrapper',
      type: 'trash',
      image: 'https://readdy.ai/api/search-image?query=A%20crumpled%20plastic%20food%20wrapper%20or%20packaging%20on%20a%20clean%20white%20background%2C%20clearly%20showing%20it%20is%20waste%20material%2C%20high%20quality%20product%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20wrinkled%20and%20discarded%20appearance&width=200&height=200&seq=9&orientation=squarish'
    },
    {
      name: 'Fresh Apple',
      type: 'donate',
      image: 'https://readdy.ai/api/search-image?query=A%20photorealistic%20fresh%20red%20apple%20on%20a%20clean%20white%20background%2C%20perfect%20condition%2C%20no%20blemishes%2C%20high%20quality%20food%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20glossy%20skin%20and%20fresh%20appearance&width=200&height=200&seq=1&orientation=squarish'
    },
    {
      name: 'Sealed Pasta',
      type: 'donate',
      image: 'https://readdy.ai/api/search-image?query=A%20sealed%20package%20of%20dry%20pasta%20on%20a%20clean%20white%20background%2C%20unopened%20pasta%20package%20in%20perfect%20condition%2C%20high%20quality%20food%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20packaging%20details%20and%20product%20clearly&width=200&height=200&seq=2&orientation=squarish'
    },
    {
      name: 'Canned Beans',
      type: 'donate',
      image: 'https://readdy.ai/api/search-image?query=A%20can%20of%20beans%20on%20a%20clean%20white%20background%2C%20unopened%20metal%20can%20in%20perfect%20condition%2C%20high%20quality%20food%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20label%20details%20and%20product%20clearly&width=200&height=200&seq=3&orientation=squarish'
    },
    {
      name: 'Banana',
      type: 'eat',
      image: 'https://readdy.ai/api/search-image?query=A%20ripe%20yellow%20banana%20on%20a%20clean%20white%20background%2C%20perfect%20condition%20with%20slight%20spotting%2C%20high%20quality%20food%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20bright%20yellow%20peel%20and%20ready-to-eat%20appearance&width=200&height=200&seq=4&orientation=squarish'
    },
    {
      name: 'Yogurt',
      type: 'eat',
      image: 'https://readdy.ai/api/search-image?query=An%20unopened%20container%20of%20yogurt%20on%20a%20clean%20white%20background%2C%20sealed%20yogurt%20cup%20in%20perfect%20condition%2C%20high%20quality%20food%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20packaging%20details%20and%20creamy%20product%20clearly&width=200&height=200&seq=5&orientation=squarish'
    },
    {
      name: 'Moldy Bread',
      type: 'compost',
      image: 'https://readdy.ai/api/search-image?query=A%20slice%20of%20bread%20with%20visible%20mold%20spots%20on%20a%20clean%20white%20background%2C%20clearly%20spoiled%20food%2C%20high%20quality%20food%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20green%20and%20white%20mold%20growth%20on%20the%20bread%20surface&width=200&height=200&seq=6&orientation=squarish'
    },
    {
      name: 'Vegetable Scraps',
      type: 'compost',
      image: 'https://readdy.ai/api/search-image?query=Vegetable%20peels%20and%20scraps%20on%20a%20clean%20white%20background%2C%20carrot%20tops%2C%20potato%20peels%2C%20and%20onion%20skins%2C%20high%20quality%20food%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20organic%20kitchen%20waste%20suitable%20for%20composting&width=200&height=200&seq=7&orientation=squarish'
    },
    {
      name: 'Coffee Grounds',
      type: 'compost',
      image: 'https://readdy.ai/api/search-image?query=Used%20coffee%20grounds%20on%20a%20clean%20white%20background%2C%20dark%20brown%20wet%20coffee%20grounds%20after%20brewing%2C%20high%20quality%20food%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20texture%20and%20appearance%20of%20used%20coffee%20grounds&width=200&height=200&seq=8&orientation=squarish'
    }
  ];

  // Start the game
  const handleStartGame = async () => {
    if (window.confirm('Ready to start? Remember:\n- Use WASD to move\n- Press Q to pick up/drop food\n- Press E to eat suitable food')) {
      try {
        // For demo purposes, using a fixed player ID. In production, this should come from user authentication
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
      } catch (error) {
        console.error('Failed to start game:', error);
        alert('Failed to start game. Please try again.');
      }
    }
  };

  // Generate food on the conveyor belt
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const interval = setInterval(() => {
      if (foods.length < 5) {
        const randomFoodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
        const newFood: Food = {
          id: Date.now(),
          type: randomFoodType.type as 'donate' | 'compost' | 'eat' | 'trash',
          x: -foodSize,
          y: 100 - foodSize / 2,
          name: randomFoodType.name,
          image: randomFoodType.image
        };
        setFoods(prevFoods => [...prevFoods, newFood]);
      }
    }, foodGenerationInterval);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  // Move food on the conveyor belt
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const moveInterval = setInterval(() => {
      setFoods(prevFoods => {
        return prevFoods
          .map(food => ({
            ...food,
            x: food.x + conveyorSpeed
          }))
          .filter(food => food.x < (gameAreaRef.current?.getBoundingClientRect().width ?? 800)); // Remove foods when they reach the end
      });
    }, 50);
    return () => clearInterval(moveInterval);
  }, [gameStarted, gameOver]);

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
      playSound('pickup');
    }
  };

  // Handle action (placing food)
  const handleAction = async () => {
    // Only prevent duplicate actions when placing food
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
        const response = await updateGame(gameId, holdingFood.type === 'donate' ? 'correct' : 'incorrect', holdingFood.type);
        setScore(response.score);
        setTime(response.time_remaining);
        
        if (holdingFood.type === 'donate') {
          playSound('success');
          showMessage('Correct! Food donated. +10 points', 'success');
        } else {
          playSound('error');
          showMessage('Wrong! This food should not be donated. -5 points', 'error');
        }
        setHoldingFood(null);
      }
      // Check if character is in the green bin zone
      else if (characterCenterX > 450 && characterCenterX < 600 && characterCenterY > 400) {
        const response = await updateGame(gameId, holdingFood.type === 'compost' ? 'correct' : 'incorrect', holdingFood.type);
        setScore(response.score);
        setTime(response.time_remaining);
        
        if (holdingFood.type === 'compost') {
          playSound('success');
          showMessage('Correct! Food composted. +10 points', 'success');
        } else {
          playSound('error');
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
        
        // 使用防抖动机制，确保短时间内只处理一次Q键事件
        const now = Date.now();
        if (now - lastActionTime < 300) {
          return; // 如果距离上次操作不到300毫秒，则忽略此次按键
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
      const response = await updateGame(gameId, holdingFood.type === 'eat' ? 'correct' : 'incorrect', holdingFood.type);
      setScore(response.score);
      setTime(response.time_remaining);

      if (holdingFood.type === 'eat') {
        showMessage('Yum! Perfect food to eat. +15 points', 'success');
      } else if (holdingFood.type === 'donate') {
        showMessage('This food should be donated instead! -5 points', 'error');
      } else if (holdingFood.type === 'trash') {
        showMessage('This is trash! Don\'t eat it! -15 points', 'error');
      } else {
        showMessage('Yuck! This food is not edible! -10 points', 'error');
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center py-8">
      <div className="w-full max-w-6xl px-4">
        <h1 className="text-4xl font-bold text-center text-green-800 mb-4">Food Waste Sorting Game</h1>
        <p className="text-lg text-center text-green-700 mb-8">
          Help reduce food waste in Melbourne by correctly sorting food items!
        </p>
        {!gameStarted && !gameOver && (
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
