/**
 * Game interfaces and type definitions
 * Contains all type definitions used across game components
 */

// Food object in the game
export interface Food {
  id: number;
  type: 'donate' | 'compost' | 'eat' | 'trash' | 'foodbank' | 'greenbin' | 'both';
  x: number;
  y: number;
  name: string;
  image: string;
}

// Food item from API
export interface FoodItem {
  id: number;
  name: string;
  type: string;
  image: string;
  description: string;
}

// API response structure
export interface ApiResponse {
  food_items: FoodItem[];
  count: number;
}

// Game difficulty levels
export type Difficulty = 'easy' | 'normal' | 'hard';

// Message type for in-game notifications
export type MessageType = 'success' | 'error' | '';

// Position coordinates
export interface Position {
  x: number;
  y: number;
}

// Game data from API
export interface GameData {
  game_id: string;
  score: number;
  time_remaining: number;
  time_played?: number;
}

// Sound types
export type SoundType = 'donate' | 'eatFood' | 'gameStart' | 'wasteFood' | 'wrongAction'; 