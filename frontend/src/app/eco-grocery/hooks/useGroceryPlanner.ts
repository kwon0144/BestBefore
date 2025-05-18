/**
 * Grocery Planner Custom Hook
 * 
 * This hook provides comprehensive functionality for meal planning and grocery list generation.
 * It manages the selection of meals, quantity adjustments, and the generation of optimized
 * grocery lists based on selected meals and current inventory.
 * 
 * Key features:
 * - Track selected meals and their quantities
 * - Add custom meals not in the predefined list
 * - Generate grocery lists organized by category
 * - Cross-reference with existing inventory to prevent duplicate purchases
 * - Manage loading and error states during API operations
 * 
 * This hook forms the core business logic for the EcoGrocery feature aimed at
 * reducing food waste through intelligent meal planning.
 */

import { useState, useCallback } from 'react';
import useInventoryStore from '@/store/useInventoryStore';
import axios from 'axios';
import { config } from '@/config';
import { GroceryItem, PantryItem } from '@/app/eco-grocery/interfaces/GroceryItem';
import { Meal } from '@/app/eco-grocery/interfaces/MealChoice';

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
 * Hook for managing meal planning and grocery list generation
 * 
 * @returns Object containing state and functions for meal planning and grocery list generation
 */
export const useGroceryPlanner = () => {
  // State for selected meals and their quantities
  const [selectedMeals, setSelectedMeals] = useState<Meal[]>([]);

  // State for grocery items retrieved from the API
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);

  // State for pantry items (ingredients already available)
  const [pantryItems, setPantryItems] = useState<Array<{ name: string; quantity: string }>>([]);

  // Loading and error states for async operations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Full grocery list response from the API
  const [groceryList, setGroceryList] = useState<GroceryListResponse | null>(null);

  // Get inventory items from the global store
  const inventoryItems = useInventoryStore((state) => state.items);

  /**
   * Add a meal to the selected list
   * 
   * If the meal already exists, its quantity is incremented.
   * Otherwise, it's added with a quantity of 1.
   * 
   * @param meal - The meal to add (requires id and name)
   */
  const addMeal = useCallback((meal: { id: number; name: string }) => {
    setSelectedMeals(prev => {
      // Check if meal already exists in the selection
      const existingMeal = prev.find(m => m.id === meal.id);

      if (existingMeal) {
        // Increment quantity if meal already exists
        return prev.map(m =>
          m.id === meal.id ? { ...m, quantity: m.quantity + 1 } : m
        );
      } else {
        // Add new meal with quantity 1
        return [...prev, { ...meal, quantity: 1 }];
      }
    });
  }, []);

  /**
   * Add a custom meal by name
   * 
   * This allows users to add meals that aren't in the predefined choices.
   * If a meal with the same name exists, its quantity is incremented.
   * 
   * @param name - The name of the custom meal to add
   */
  const addCustomMeal = useCallback((name: string) => {
    // Skip if name is empty
    if (!name.trim()) return;

    setSelectedMeals(prev => {
      // Check if a meal with the same name already exists (case insensitive)
      const existingMeal = prev.find(m =>
        m.name.toLowerCase() === name.toLowerCase()
      );

      if (existingMeal) {
        // Increment quantity if meal with same name exists
        return prev.map(m =>
          m.name.toLowerCase() === name.toLowerCase()
            ? { ...m, quantity: m.quantity + 1 }
            : m
        );
      } else {
        // Generate a unique ID for the custom meal
        // Starting from 1000 to avoid conflicts with predefined meals
        const maxId = prev.length > 0
          ? Math.max(...prev.map(m => m.id))
          : 1000;

        // Add new custom meal
        return [...prev, {
          id: maxId + 1,
          name: name.trim(),
          quantity: 1
        }];
      }
    });
  }, []);

  /**
   * Remove a meal from the selected list
   * 
   * @param id - The ID of the meal to remove
   */
  const removeMeal = useCallback((id: number) => {
    setSelectedMeals(prev => prev.filter(meal => meal.id !== id));
    setGroceryItems([]);
  }, []);

  /**
   * Adjust the quantity of a selected meal
   * 
   * @param id - The ID of the meal to adjust
   * @param change - The amount to change (positive or negative)
   */
  const adjustQuantity = useCallback((id: number, change: number) => {
    setSelectedMeals(prev => prev.map(meal => {
      if (meal.id === id) {
        // Ensure quantity never goes below 1
        const newQuantity = Math.max(1, meal.quantity + change);
        return { ...meal, quantity: newQuantity };
      }
      return meal;
    }));
  }, []);

  /**
   * Generate grocery list based on selected meals
   * 
   * This function calls the backend API to generate an optimized grocery list
   * based on the selected meals and current inventory items.
   */
  const generateGroceryList = useCallback(async () => {
    // Skip if no meals are selected
    if (selectedMeals.length === 0) return;

    // Set loading state and clear previous errors
    setLoading(true);
    setError(null);

    try {
      // Call the API to generate grocery list
      const response = await axios.post(`${config.apiUrl}/api/search-dishes/`, {
        selected_meals: selectedMeals,
        // Format inventory items for the API
        inventory: inventoryItems.map(item => ({
          name: item.name.toLowerCase(),
          quantity: item.quantity,
          location: item.location,
          days_left: item.daysLeft
        }))
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: false
      });

      // Handle non-200 responses
      if (response.status !== 200) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = response.data as GroceryListResponse;

      if (data.success) {
        // Process and organize grocery items by category
        const newGroceryItems: GroceryItem[] = [];
        const categories = data.items_by_category || {};

        // Flatten categorized items into a single array with category information
        Object.keys(categories).forEach(category => {
          categories[category].forEach((item: GroceryItem) => {
            newGroceryItems.push({
              name: item.name,
              quantity: item.quantity,
              category: category
            });
          });
        });

        setGroceryItems(newGroceryItems);

        // Use inventory items instead of API pantry items for consistency
        // Transform inventory items to match the pantryItems format
        const inventoryPantryItems = inventoryItems.map(item => ({
          name: item.name,
          quantity: item.quantity
        }));
        setPantryItems(inventoryPantryItems);

        // Store the full response for potential future use
        setGroceryList(data);
      } else {
        // Handle API error response
        setError(data.error || 'Failed to generate for gorcery list for invalid meal(s)');
      }
    } catch (err: unknown) {
      // Handle any exceptions during API call
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  }, [selectedMeals, inventoryItems]);

  /**
   * Get grocery items filtered by category
   * 
   * @param category - The category to filter by
   * @returns Array of grocery items in the specified category
   */
  const getGroceryItemsByCategory = useCallback((category: string) => {
    return groceryItems.filter(item => item.category === category);
  }, [groceryItems]);

  /**
   * Clear the grocery list and related data
   */
  const clearGroceryList = useCallback(() => {
    setGroceryList(null);
    setGroceryItems([]);
    setPantryItems([]);
  }, []);

  // Return all state and functions for use in components
  return {
    selectedMeals,
    groceryItems,
    pantryItems,
    loading,
    error,
    groceryList,
    addMeal,
    addCustomMeal,
    removeMeal,
    adjustQuantity,
    generateGroceryList,
    getGroceryItemsByCategory,
    clearGroceryList
  };
}; 