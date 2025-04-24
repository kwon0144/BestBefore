import { useState, useCallback } from 'react';
import useInventoryStore, { FoodItem } from '@/store/useInventoryStore';
import axios from 'axios';
import { config } from '@/config';

// Type for grocery list API response
export type GroceryListResponse = {
  success: boolean;
  dishes?: string[];
  items_by_category?: Record<string, any[]>;
  pantry_items?: Array<{name: string; quantity: string}>;
  error?: string;
};

// Type for grocery item
export type GroceryItem = {
  name: string; 
  quantity: string; 
  category: string;
};

// Type for meal
export type Meal = {
  id: number; 
  name: string; 
  quantity: number;
};

export const useGroceryPlanner = () => {
  const [selectedMeals, setSelectedMeals] = useState<Meal[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [pantryItems, setPantryItems] = useState<Array<{name: string; quantity: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryListResponse | null>(null);
  
  const inventoryItems = useInventoryStore((state) => state.items);
  
  // Add a meal to the selected list
  const addMeal = useCallback((meal: {id: number; name: string}) => {
    setSelectedMeals(prev => {
      const existingMeal = prev.find(m => m.id === meal.id);
      if (existingMeal) {
        return prev.map(m =>
          m.id === meal.id ? {...m, quantity: m.quantity + 1} : m
        );
      } else {
        return [...prev, {...meal, quantity: 1}];
      }
    });
  }, []);
  
  // Add custom meal
  const addCustomMeal = useCallback((name: string) => {
    if (!name.trim()) return;
    
    setSelectedMeals(prev => {
      const existingMeal = prev.find(m => 
        m.name.toLowerCase() === name.toLowerCase()
      );
      
      if (existingMeal) {
        return prev.map(m =>
          m.name.toLowerCase() === name.toLowerCase() 
          ? {...m, quantity: m.quantity + 1} 
          : m
        );
      } else {
        // Generate a unique ID for the custom meal
        const maxId = prev.length > 0 
          ? Math.max(...prev.map(m => m.id)) 
          : 1000;
        
        return [...prev, {
          id: maxId + 1, 
          name: name.trim(), 
          quantity: 1
        }];
      }
    });
  }, []);
  
  // Remove a meal from the selected list
  const removeMeal = useCallback((id: number) => {
    setSelectedMeals(prev => prev.filter(meal => meal.id !== id));
  }, []);
  
  // Adjust the quantity of a meal
  const adjustQuantity = useCallback((id: number, change: number) => {
    setSelectedMeals(prev => prev.map(meal => {
      if (meal.id === id) {
        const newQuantity = Math.max(1, meal.quantity + change);
        return {...meal, quantity: newQuantity};
      }
      return meal;
    }));
  }, []);
  
  // Generate grocery list based on selected meals
  const generateGroceryList = useCallback(async () => {
    if (selectedMeals.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Add a log to see what's being sent
      console.log("Sending request with meals:", selectedMeals);
      console.log("Sending inventory data:", inventoryItems);
      
      const response = await axios.post(`${config.apiUrl}/api/search-dishes/`, {
        selected_meals: selectedMeals,
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
      
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      
      if (response.status !== 200) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = response.data as GroceryListResponse;
      
      if (data.success) {
        // Process and set grocery items by category
        const newGroceryItems: GroceryItem[] = [];
        const categories = data.items_by_category || {};
        
        Object.keys(categories).forEach(category => {
          categories[category].forEach((item: any) => {
            newGroceryItems.push({
              name: item.name,
              quantity: item.quantity,
              category: category
            });
          });
        });
        
        setGroceryItems(newGroceryItems);
        
        // Use inventory items instead of API pantry items
        // Transform inventory items to match the pantryItems format
        const inventoryPantryItems = inventoryItems.map(item => ({
          name: item.name,
          quantity: item.quantity
        }));
        setPantryItems(inventoryPantryItems);
        
        setGroceryList(data);
      } else {
        setError(data.error || 'Failed to generate grocery list');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error generating grocery list:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMeals, inventoryItems]);
  
  // Get items by category
  const getGroceryItemsByCategory = useCallback((category: string) => {
    return groceryItems.filter(item => item.category === category);
  }, [groceryItems]);
  
  // Clear grocery list
  const clearGroceryList = useCallback(() => {
    setGroceryList(null);
    setGroceryItems([]);
    setPantryItems([]);
  }, []);
  
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