"use client";

/**
 * Game Page Component
 * Main entry point for the food waste game
 * Manages game state transitions between different screens
 * 
 * Features:
 * - Game state management
 * - Screen transitions between different game phases
 * - Fullscreen functionality (toggled via button in the bottom-right corner of GameArea)
 */
import React, { useState, useEffect } from 'react';
import { startGame, endGame, getGameResources } from '@/services/gameService';
import { Difficulty, WasteStats } from './interfaces';
import { playSound, stopBackgroundMusic } from './utils/soundEffects';

// Custom hooks
import useGameState from './hooks/useGameState';

// Components
import PreGamePage from './components/PreGamePage';
import HowToPlay from './components/HowToPlay';
import GameArea from './components/GameArea';
import GameOver from './components/GameOver';

/**
 * Main game page that manages screen transitions and game flow
 */
export default function Game() {
  // Screen state
  const [showPreGame, setShowPreGame] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [wasteStats, setWasteStats] = useState<WasteStats>({
    wastedFoods: {},
    totalWasted: 0
  });
  
  // Get game state from custom hook
  const { 
    score, setScore, time, setTime, gameId, setGameId,
    playerId, setPlayerId, foodItems, loading, 
    soundsLoaded
  } = useGameState();

  // Add state for background image
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [resultBgImage, setResultBgImage] = useState<string | null>(null);

  // Load game resources and set background
  useEffect(() => {
    const loadGameResources = async () => {
      try {
        const resources = await getGameResources();
        if (resources.specificResources.background?.image) {
          setBackgroundImage(resources.specificResources.background.image);
        }
        
        // Load Result_BG for game over screen
        if (resources.specificResources.result_bg?.image) {
          setResultBgImage(resources.specificResources.result_bg.image);
          console.log('Loaded result background:', resources.specificResources.result_bg.image);
        } else {
          console.log('Result background not found in resources');
        }
      } catch (error) {
        console.error('Failed to load background resources:', error);
      }
    };
    loadGameResources();
  }, []);

  /**
   * Handles starting the game
   * First click: Shows "How to Play" screen
   * Second click: Starts the actual game
   */
  const handleStartGame = async () => {
    // First click: Show "How to Play" screen
    if (showPreGame) {
      setShowPreGame(false);
      return;
    }

    // Second click: Start the actual game without confirmation
    try {
      // Reset waste stats
      setWasteStats({
        wastedFoods: {},
        totalWasted: 0
      });

      // Start new game
      const response = await startGame(playerId || 'anonymous');
      setGameId(response.game_id);
      setScore(0);
      setTime(60);
      setGameStarted(true);
      setGameOver(false);
      
      // Play game start sound only when actually starting the game
      if (soundsLoaded) {
        console.log('Playing game start sound');
        playSound('gameStart');
        // Start background music
        playSound('backgroundMusic');
      }
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  /**
   * Handles restart after game over
   * Returns player to the pre-game page instead of directly restarting
   */
  const handleRestartGame = () => {
    // Reset game states
    setGameStarted(false);
    setGameOver(false);
    setShowPreGame(true);
    setScore(0);
    setTime(120);
    
    // Remove the sound play here since we're just going back to pre-game
  };

  /**
   * Handles game over event
   * Ends the game and updates final score
   */
  const handleGameOver = async (stats: WasteStats) => {
    if (!gameId) return;

    try {
      await endGame(gameId);
      setWasteStats(stats);
      setGameOver(true);
      setGameStarted(false);
      
      console.log('Game over state set:', { gameOver: true, resultBgImage });
      
      // Play game over sound and stop background music
      if (soundsLoaded) {
        playSound('gameOver');
        stopBackgroundMusic();
      }
    } catch (error) {
      console.error('Failed to end game:', error);
      setGameOver(true);
      // Ensure background music stops even on error
      stopBackgroundMusic();
    }
  };

  // Return early if sounds haven't loaded
  if (!soundsLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center">
        <p className="text-xl text-green-800">Loading game resources...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: gameOver && resultBgImage 
          ? `url(${resultBgImage})` 
          : backgroundImage 
            ? `url(${backgroundImage})` 
            : 'linear-gradient(to bottom, #e0f7fa, #b2ebf2)',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-20">
        
        {/* Pre-game screen */}
        {!gameStarted && !gameOver && showPreGame && (
          <PreGamePage 
            foodItems={foodItems}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            handleStartGame={handleStartGame}
            loading={loading}
          />
        )}
        
        {/* How to play screen */}
        {!gameStarted && !gameOver && !showPreGame && (
          <HowToPlay 
            handleStartGame={handleStartGame} 
          />
        )}
        
        {/* Game over screen */}
        {gameOver && (
          <GameOver 
            score={score}
            wasteStats={wasteStats}
            handleStartGame={handleRestartGame} 
          />
        )}
        
        {/* Main game screen */}
        {gameStarted && !gameOver && (
          <GameArea 
            gameId={gameId}
            score={score}
            setScore={setScore}
            time={time}
            setTime={setTime}
            difficulty={difficulty}
            foodItems={foodItems}
            handleGameOver={handleGameOver}
          />
        )}
      </div>
    </div>
  );
}
