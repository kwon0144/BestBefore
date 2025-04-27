import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FoodItem = {
  id: string;
  name: string;
  quantity: string;
  location: 'refrigerator' | 'pantry';
  expiryDate: string; // ISO date string
  daysLeft?: number; // Calculated field
};

type InventoryState = {
  items: FoodItem[];
  // Actions
  addItem: (item: Omit<FoodItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<Omit<FoodItem, 'id'>>) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  // Camera identification function
  addIdentifiedItem: (itemName: string, quantity?: string, expiryDays?: number) => void;
  // Utility functions
  getItemsByLocation: (location: FoodItem['location']) => FoodItem[];
  calculateDaysLeft: (expiryDate: string) => number;
  refreshDaysLeft: () => void;
};

const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: [], // Start with empty inventory instead of sample data

      // Add a new item to the inventory
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

      // Update an existing item
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

      // Remove an item
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      // Get items by location (refrigerator, pantry)
      getItemsByLocation: (location) => {
        return get().items.filter((item) => item.location === location);
      },

      // Calculate days left until expiry
      calculateDaysLeft: (expiryDate) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
      },

      // Refresh days left for all items
      refreshDaysLeft: () => {
        set((state) => ({
          items: state.items.map((item) => ({
            ...item,
            daysLeft: get().calculateDaysLeft(item.expiryDate),
          })),
        }));
      },

      // Add an item identified by camera
      addIdentifiedItem: (itemName, quantity = '1 item', expiryDays = 7) => {
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
          });
        } else {
          // If item doesn't exist, add new item
          const newItem: Omit<FoodItem, 'id'> = {
            name: itemName,
            quantity: quantity,
            location: 'refrigerator', // Default location for camera-identified items
            expiryDate: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
          };
          
          get().addItem(newItem);
        }
      },

      // Clear all items from the inventory
      clearAll: () => {
        set({ items: [] });
      },

    
    }),
    {
      name: 'food-inventory-storage', // name for localStorage
      onRehydrateStorage: () => (state) => {
        
        if (state) {
          state.refreshDaysLeft();
        }
      }
    }
  )
);

export default useInventoryStore; 