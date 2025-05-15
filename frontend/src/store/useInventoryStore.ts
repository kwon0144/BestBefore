/**
 * This module implements a Zustand store for managing user's food inventory.
 * It handles storing, retrieving, and managing food items with their expiry dates,
 * providing functionality to track what items are in the refrigerator and pantry.
 */
import { create } from 'zustand';

/**
 * Represents a food item in the inventory
 * @interface
 */
export type FoodItem = {
  id: string;
  name: string;
  quantity: string;
  location: 'refrigerator' | 'pantry';
  expiryDate: string; // ISO date string
  daysLeft?: number; // Calculated field
};

/**
 * Defines the state and actions available in the inventory store
 * @interface
 */
type InventoryState = {
  items: FoodItem[];
  // Actions
  addItem: (item: Omit<FoodItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<Omit<FoodItem, 'id'>>) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  // Camera identification function
  addIdentifiedItem: (itemName: string, quantity?: string, expiryDays?: number, location?: FoodItem['location']) => void;
  // Utility functions
  getItemsByLocation: (location: FoodItem['location']) => FoodItem[];
  calculateDaysLeft: (expiryDate: string) => number;
  refreshDaysLeft: () => void;
};

/**
 * Custom hook that creates and provides access to the inventory store
 * @returns {InventoryState} The inventory store state and actions
 */
const useInventoryStore = create<InventoryState>()((set, get) => ({
  items: [], // Start with empty inventory instead of sample data

  /**
   * Adds a new item to the inventory
   * @param {Omit<FoodItem, 'id'>} item - The food item to add (without ID)
   */
  addItem: (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(), // Generate a unique ID
      daysLeft: get().calculateDaysLeft(item.expiryDate),
    };

    set((state) => ({
      items: [...state.items, newItem],
    }));
  },

  /**
   * Updates an existing item in the inventory
   * @param {string} id - The ID of the item to update
   * @param {Partial<Omit<FoodItem, 'id'>>} updates - The properties to update
   */
  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
            ...item,
            ...updates,
            // Recalculate days left if expiry date is updated
            daysLeft: updates.expiryDate
              ? get().calculateDaysLeft(updates.expiryDate)
              : item.daysLeft
          }
          : item
      ),
    }));
  },

  /**
   * Removes an item from the inventory
   * @param {string} id - The ID of the item to remove
   */
  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  /**
   * Retrieves items from a specific location (refrigerator or pantry)
   * @param {FoodItem['location']} location - The location to filter by
   * @returns {FoodItem[]} Array of items in the specified location
   */
  getItemsByLocation: (location) => {
    return get().items.filter((item) => item.location === location);
  },

  /**
   * Calculates days remaining until an item expires
   * @param {string} expiryDate - ISO date string of expiration date
   * @returns {number} Number of days left (0 if already expired)
   */
  calculateDaysLeft: (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  },

  /**
   * Updates the daysLeft property for all items based on current date
   * Should be called periodically to ensure freshness information is accurate
   */
  refreshDaysLeft: () => {
    set((state) => ({
      items: state.items.map((item) => ({
        ...item,
        daysLeft: get().calculateDaysLeft(item.expiryDate),
      })),
    }));
  },

  /**
   * Adds an item identified by camera or other automatic means
   * Handles duplicate items by updating quantity rather than creating new entries
   * @param {string} itemName - Name of the identified food item
   * @param {string} [quantity='1 item'] - Quantity of the item
   * @param {number} [expiryDays=7] - Default days until expiry
   * @param {FoodItem['location']} [location='refrigerator'] - Storage location for the item
   */
  addIdentifiedItem: (itemName, quantity = '1 item', expiryDays = 7, location = 'refrigerator') => {
    // Check if item with same name already exists
    const existingItem = get().items.find(
      (item) => item.name.toLowerCase() === itemName.toLowerCase()
    );

    if (existingItem) {
      // If item exists, update its quantity and expiry date
      const updatedQuantity = existingItem.quantity.includes('g') && quantity.includes('g')
        ? `${parseInt(existingItem.quantity) + parseInt(quantity)}g`
        : `${existingItem.quantity}, ${quantity}`;

      get().updateItem(existingItem.id, {
        quantity: updatedQuantity,
        // Reset expiry date to new value
        expiryDate: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
        // Update location if different
        location: location as FoodItem['location']
      });
    } else {
      // If item doesn't exist, add new item
      const newItem: Omit<FoodItem, 'id'> = {
        name: itemName,
        quantity: quantity,
        location: location as FoodItem['location'],
        expiryDate: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
      };

      get().addItem(newItem);
    }
    
    // Log the action for debugging
    console.log(`Added/updated item in inventory: ${itemName} in ${location} with ${expiryDays} days until expiry`);
  },

  /**
   * Clears all items from the inventory
   */
  clearAll: () => {
    set({ items: [] });
  },
}));

export default useInventoryStore; 