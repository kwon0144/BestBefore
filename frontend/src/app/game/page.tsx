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
import React, { useState, useRef } from 'react';
import { startGame, endGame } from '@/services/gameService';
import { Difficulty, WasteStats } from './interfaces';
import { playSound, stopBackgroundMusic } from './utils/soundEffects';

// Custom hooks
import useGameState from './hooks/useGameState';

// Components
import PreGamePage from './components/PreGamePage';
import HowToPlay from './components/HowToPlay';
import GameArea from './components/GameArea';
import GameOver from './components/GameOver';
import Title from '../(components)/Title';

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
  
  // Create ref for the main content div to scroll to
  const mainContentRef = useRef<HTMLDivElement>(null);
  
  // Get game state from custom hook
  const { 
    score, setScore, time, setTime, gameId, setGameId,
    playerId, foodItems, loading,
    soundsLoaded, backgroundImage, resultBgImage, gameResources, resourcesLoading
  } = useGameState();

  // Loading indicator when resources are loading
  if (resourcesLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center">
        <p className="text-xl text-green-800">Loading game resources...</p>
      </div>
    );
  }

  /**
   * Scrolls to the main content div
   */
  const scrollToMainContent = () => {
    if (mainContentRef.current) {
      // Get the position of the element
      const elementPosition = mainContentRef.current.getBoundingClientRect().top;
      // Calculate the target position with offset for navbar (20px)
      const offsetPosition = elementPosition + window.pageYOffset - 100;
      
      // Scroll to the element with the offset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  /**
   * Handles starting the game
   * First click: Shows "How to Play" screen
   * Second click: Starts the actual game
   */
  const handleStartGame = async () => {
    // First click: Show "How to Play" screen
    if (showPreGame) {
      setShowPreGame(false);
      // Scroll to the main content div
      scrollToMainContent();
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
      setTime(100);
      setGameStarted(true);
      setGameOver(false);
      
      // Scroll to the main content div
      scrollToMainContent();
      
      // Play game start sound only when actually starting the game
      if (soundsLoaded) {
        playSound('gameStart');
        // Start background music
        playSound('backgroundMusic');
      }
    } catch (error) {
      alert('Failed to start game. Please try again.');
    }
  };

  /**
   * Handles going back from How to Play to PreGame screen
   */
  const handleBack = () => {
    setShowPreGame(true);
    // Scroll to the main content div
    scrollToMainContent();
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
    
    // Scroll to the main content div
    scrollToMainContent();
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
      
      // Scroll to the main content div
      scrollToMainContent();
      
      // Play game over sound and stop background music
      if (soundsLoaded) {
        playSound('gameOver');
        stopBackgroundMusic();
      }
    } catch (error) {
      setGameOver(true);
      // Ensure background music stops even on error
      stopBackgroundMusic();
    }
  };

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
      {/* Page header with title and background image */}
      <div className="py-12">
        <Title 
        heading="Food Waste Game" 
        description="Learn to sort food waste correctly and reduce environmental impact through fun gameplay." 
        />
      </div>
      <div ref={mainContentRef} className="relative z-10 max-w-6xl mx-auto px-4 pb-40">

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
            handleBack={handleBack}
          />
        )}
        
        {/* Game over screen */}
        {gameOver && (
          <GameOver 
            score={score}
            wasteStats={wasteStats}
            handleStartGame={handleRestartGame}
            gameResources={gameResources}
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
            gameResources={gameResources}
          />
        )}
      </div>
    </div>
  );
}
