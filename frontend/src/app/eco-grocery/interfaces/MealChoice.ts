/**
 * Meal Choice Interfaces
 * 
 * This file defines the types and interfaces related to meal choices and signature dishes
 * used in the EcoGrocery feature. These interfaces handle the meal selection aspect of
 * the grocery planning process.
 */

/**
 * Interface for meal choices displayed to users for selection
 */
export interface MealChoice {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    cuisine?: string;
}

/**
 * Interface for signature dishes retrieved from the API
 */
export interface SignatureDish {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    cuisine: string;
}

/**
 * Interface for selected meals in the planner
 */
export interface Meal {
    id: number;
    name: string;
    quantity: number;
} 