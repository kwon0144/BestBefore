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