"use client";

/**
 * Game Page Component
 * Main entry point for the food waste game
 * Manages game state transitions between different screens
 */
import React, { useState } from 'react';
import { startGame, endGame } from '@/services/gameService';
import { Difficulty } from './interfaces';
import { playSound } from './utils/soundEffects';

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
  
  // Get game state from custom hook
  const { 
    score, setScore, time, setTime, gameId, setGameId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    playerId, setPlayerId, foodItems, loading, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error, soundsLoaded
  } = useGameState();

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

    // Second click: Start the game without confirmation
      try {
        const demoPlayerId = 'demo-player-1';
        setPlayerId(demoPlayerId);
        const gameData = await startGame(demoPlayerId);
        setGameId(gameData.game_id);
        setGameStarted(true);
        setGameOver(false);
        setScore(gameData.score);
        setTime(gameData.time_remaining);
        
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
    setTime(60);
    
    // Optionally play a sound if needed
          if (soundsLoaded) {
      playSound('gameStart');
    }
  };

  /**
   * Handles game over event
   * Ends the game and updates final score
   */
  const handleGameOver = async () => {
    if (!gameId) return;

    try {
      const response = await endGame(gameId);
      setGameOver(true);
      setScore(response.score);
      setTime(response.time_played || 0);
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
