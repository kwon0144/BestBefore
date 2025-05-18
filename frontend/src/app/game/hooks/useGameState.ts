/**
 * Custom hook for managing game state
 * Handles data fetching and state management for game data
 */
import { useState, useEffect } from 'react';
import axios from "axios";
import { config } from "@/config";
import { FoodItem, ApiResponse, ResourcesApiResponse } from '../interfaces';
import { getGameResources } from '@/services/gameService';

/**
 * Hook for managing game state and food items data
 * @returns Game state and setter functions
 */
export default function useGameState() {
  // Game state
  const [score, setScore] = useState<number>(0);
  const [time, setTime] = useState<number>(60);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  
  // Food items data
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sound loading state
  const [soundsLoaded, setSoundsLoaded] = useState(false);

  // Game resources state
  const [gameResources, setGameResources] = useState<ResourcesApiResponse | null>(null);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [resultBgImage, setResultBgImage] = useState<string | null>(null);

  // Initialize sounds when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set sounds as loaded immediately since we're using direct URLs
      setSoundsLoaded(true);
    }
  }, []);

  // Centralized game resources loading
  useEffect(() => {
    const loadGameResources = async () => {
      try {
        setResourcesLoading(true);
        const resources = await getGameResources();
        setGameResources(resources);
        
        // Extract background images
        if (resources.specificResources.background?.image) {
          setBackgroundImage(resources.specificResources.background.image);
        }
        
        // Load Result_BG for game over screen
        if (resources.specificResources.result_bg?.image) {
          setResultBgImage(resources.specificResources.result_bg.image);
        }
        
        setResourcesError(null);
      } catch (error) {
        console.error('Failed to load game resources:', error);
        setResourcesError('Failed to load game resources. Please refresh.');
      } finally {
        setResourcesLoading(false);
      }
    };
    
    loadGameResources();
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
    soundsLoaded,
    
    // Resources state
    gameResources,
    resourcesLoading,
    resourcesError,
    backgroundImage,
    resultBgImage
  };
} 