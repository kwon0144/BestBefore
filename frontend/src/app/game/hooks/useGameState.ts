/**
 * Custom hook for managing game state
 * Handles data fetching and state management for game data
 */
import { useState, useEffect } from 'react';
import axios from "axios";
import { config } from "@/config";
import { FoodItem, ApiResponse } from '../interfaces';

/**
 * Hook for managing game state and food items data
 * @returns Game state and setter functions
 */
export default function useGameState() {
  // Game state
  const [score, setScore] = useState<number>(0);
  const [time, setTime] = useState<number>(120);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  
  // Food items data
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sound loading state
  const [soundsLoaded, setSoundsLoaded] = useState(false);

  // Initialize sounds when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set sounds as loaded immediately since we're using direct URLs
      setSoundsLoaded(true);
    }
  }, []);

  // Fetch food items from API
  useEffect(() => {
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
    
    fetchFoodItems();
  }, []);

  return {
    // Game state
    score,
    setScore,
    time,
    setTime,
    gameId, 
    setGameId,
    playerId, 
    setPlayerId,
    
    // Food items state
    foodItems,
    loading,
    error,
    
    // Sound state
    soundsLoaded
  };
} 