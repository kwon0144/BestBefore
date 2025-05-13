/**
 * Game interfaces and type definitions
 * Contains all type definitions used across game components
 */

// Food object in the game
export interface Food {
  id: number;
  type: 'food bank' | 'green waste bin' | 'trash';
  x: number;
  y: number;
  name: string;
  image: string;
  segment?: number; // Track which segment of the conveyor belt the food is on
  diy_option?: boolean; // Whether the food can be DIYed
}

// Food item from API
export interface FoodItem {
  id: number;
  name: string;
  type: string;
  image: string;
  description: string;
  diy_option?: boolean; // Whether the food can be DIYed
}

// Game resource from API
export interface GameResource {
  id: number;
  name: string;
  type: string;
  description: string;
  image: string;
}

// Specific resources for game areas
export interface SpecificResources {
  background?: GameResource;
  foodbank?: GameResource;
  greenbin?: GameResource;
  diy?: GameResource;
  conveyor?: GameResource;
  [key: string]: GameResource | undefined;
}

// API response structure
export interface ApiResponse {
  food_items: FoodItem[];
  count: number;
}

// API response for game resources
export interface ResourcesApiResponse {
  status: string;
  count: number;
  resources: GameResource[];
  specificResources?: SpecificResources;
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
export type SoundType = 'donate' | 'diyFood' | 'gameStart' | 'wasteFood' | 'wrongAction' | 'pickup';

// Food waste tracking
export interface WastedFood {
  name: string;
  count: number;
}

export interface WasteStats {
  wastedFoods: { [key: string]: WastedFood };
  totalWasted: number;
} 