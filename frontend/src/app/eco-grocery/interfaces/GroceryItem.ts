/**
 * Grocery Item Interfaces
 * 
 * This file defines the types and interfaces related to grocery items and pantry management
 * used in the EcoGrocery feature. These interfaces handle the grocery list generation and
 * inventory tracking aspects of the grocery planning process.
 */

/**
 * Interface for grocery items in the shopping list
 */
export interface GroceryItem {
    name: string;
    quantity: string;
    category: string;
}

/**
 * Interface for pantry items available in user's inventory
 */
export interface PantryItem {
    name: string;
    quantity: string;
}

/**
 * Interface for the grocery list API response structure
 */
export interface GroceryListResponse {
    success: boolean;
    dishes?: string[];
    items_by_category?: Record<string, GroceryItem[]>;
    pantry_items?: Array<PantryItem>;
    error?: string;
}

/**
 * Props for the GroceryList component
 */
export interface GroceryListProps {
    selectedMeals: { id: number; name: string; quantity: number }[];
    groceryItems: GroceryItem[];
    pantryItems: PantryItem[];
    loading: boolean;
    error: string | null;
    getGroceryItemsByCategory: (category: string) => GroceryItem[];
    generateGroceryList?: () => void;
} 