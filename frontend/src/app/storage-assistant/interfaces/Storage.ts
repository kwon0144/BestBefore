// Storage related interfaces

/**
 * Interface for storage recommendation including fridge and pantry items
 */
export interface StorageRecommendation {
    fridge: Array<{
        name: string;
        quantity: number;
    }>;
    pantry: Array<{
        name: string;
        quantity: number;
    }>;
}

/**
 * Interface for storage advice API response
 */
export interface StorageAdviceResponse {
    // Database-style response
    Type?: string;
    pantry?: number;
    fridge?: number;
    method?: number | string; // 0=pantry, 1=fridge or 'pantry'/'fridge'

    // Claude-style response
    days?: number;

    // Common fields
    source?: 'database' | 'claude' | 'database_default'; // Source of the recommendation
}

/**
 * Interface for food types API response
 */
export interface FoodTypesResponse {
    food_types: string[];
} 