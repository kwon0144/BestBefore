/**
 * StorageRecommendations Component
 * 
 * A React component that displays and manages storage recommendations for food items.
 * It provides functionality to:
 * - Display items recommended for refrigerator and pantry storage
 * - Add new items to either storage location
 * - Edit existing items (name and quantity)
 * - Delete items
 * - Drag and drop items between storage locations
 * - Sync with the inventory store
 * 
 */

import React, { useState, useEffect } from 'react';
import { StorageRecommendation } from '../interfaces/Storage';
import { faSnowflake, faBoxOpen, faPlus, faTrash, faEdit, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addToast, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from '@heroui/react';
import useInventoryStore from '@/store/useInventoryStore';
import { useStorageAdvice } from '../hooks/useStorageAdvice';

/**
 * Props interface for the StorageRecommendations component
 * @interface StorageRecommendationsProps
 * @property {StorageRecommendation} storageRecs - Current storage recommendations
 * @property {(newStorageRecs: StorageRecommendation) => void} onUpdateStorageRecs - Callback to update storage recommendations
 */
interface StorageRecommendationsProps {
  storageRecs: StorageRecommendation;
  onUpdateStorageRecs: (newStorageRecs: StorageRecommendation) => void;
}

type RecommendationDialog = {
  isOpen: boolean;
  itemName: string;
  recommendedSection: 'fridge' | 'pantry';
  userSelectedSection: 'fridge' | 'pantry';
  fridgeTime: number;
  pantryTime: number;
  sourceLabel: string;
  sourceSection?: 'fridge' | 'pantry';
  sourceIndex?: number;
  item: { name: string; quantity: number; storageTime?: number };
} | null;

/**
 * StorageRecommendations Component
 * 
 * @component
 * @param {StorageRecommendationsProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const StorageRecommendations: React.FC<StorageRecommendationsProps> = ({ storageRecs, onUpdateStorageRecs }) => {
  const [editingItem, setEditingItem] = useState<{ index: number; section: 'fridge' | 'pantry' } | null>(null);
  const [newItem, setNewItem] = useState<{ name: string; quantity: number }>({ name: '', quantity: 1 });
  const [showAddForm, setShowAddForm] = useState<{ section: 'fridge' | 'pantry' } | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; quantity: number }>({ name: '', quantity: 1 });
  const [draggedItem, setDraggedItem] = useState<{ 
    index: number; 
    section: 'fridge' | 'pantry'; 
    item: { name: string; quantity: number } 
  } | null>(null);
  
  // State for recommendation dialog
  const [recommendationDialog, setRecommendationDialog] = useState<RecommendationDialog>(null);

  // Get inventory store functions
  const { items, addItem, updateItem, removeItem } = useInventoryStore();

  // Use our custom hook for storage advice
  const { getStorageAdvice } = useStorageAdvice();

  // Effect to sync with inventory store on mount and when inventory changes
  useEffect(() => {
    // Only synchronize if storage recommendations are empty
    if (storageRecs.fridge.length === 0 && storageRecs.pantry.length === 0 && items.length > 0) {
      const newStorageRecs: StorageRecommendation = {
        fridge: [],
        pantry: []
      };
      
      // Convert items from inventory store to storage recommendations format
      items.forEach(item => {
        // Extract days from item's expiry date
        const expiryDate = new Date(item.expiryDate);
        const now = new Date();
        const diffTime = expiryDate.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Extract quantity from item's quantity string
        const qtyMatch = item.quantity.match(/^(\d+)/);
        const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
        
        // Capitalize the item name
        const capitalizedName = capitalizeWords(item.name);
        
        // Create storage recommendation item
        const storageItem = {
          name: `${capitalizedName} (${daysLeft > 0 ? daysLeft : 0} days)`,
          quantity: quantity
        };
        
        // Add to appropriate section
        if (item.location === 'refrigerator') {
          newStorageRecs.fridge.push(storageItem);
        } else if (item.location === 'pantry') {
          newStorageRecs.pantry.push(storageItem);
        }
      });
      
      // Update parent component's state if we found items
      if (newStorageRecs.fridge.length > 0 || newStorageRecs.pantry.length > 0) {
        onUpdateStorageRecs(newStorageRecs);
      }
    }
  }, [items, storageRecs.fridge.length, storageRecs.pantry.length, onUpdateStorageRecs]);

  // Check if both sections are empty
  const noItemsDetected = storageRecs.fridge.length === 0 && storageRecs.pantry.length === 0;

  /**
   * Capitalizes the first letter of each word in a string
   * @param {string} text - Text to capitalize
   * @returns {string} Text with first letter of each word capitalized
   */
  const capitalizeWords = (text: string): string => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  /**
   * Handles the edit operation for an item
   * @param {number} index - Index of the item to edit
   * @param {'fridge' | 'pantry'} section - Storage section containing the item
   */
  const handleEdit = (index: number, section: 'fridge' | 'pantry') => {
    // Check if the item exists at the specified index
    if (!storageRecs[section] || !storageRecs[section][index]) {
      console.error(`Item at index ${index} in ${section} not found`);
      return;
    }
    
    const item = storageRecs[section][index];
    
    // Check if the item has a name property
    if (!item || !item.name) {
      console.error('Item or item name is undefined', item);
      return;
    }
    
    const itemName = item.name.split(' (')[0];
    setEditValues({ name: itemName, quantity: item.quantity });
    setEditingItem({ index, section });
  };

  /**
   * Saves edited item information
   * @param {number} index - Index of the item being edited
   * @param {'fridge' | 'pantry'} section - Storage section containing the item
   */
  const handleSave = async (index: number, section: 'fridge' | 'pantry') => {
    const newStorageRecs = { ...storageRecs };
    const item = newStorageRecs[section][index];
    
    if (!item || !item.name) {
      console.error('Item or item name is undefined', item);
      setEditingItem(null);
      return;
    }
    
    const originalName = item.name.split(' (')[0];
    
    // If name changed, try to get storage time from API
    if (editValues.name !== originalName) {
      try {
        // Use our custom hook instead of direct axios call
        const advice = await getStorageAdvice(editValues.name);
        
        if (!advice) {
          throw new Error(`Failed to get storage advice for ${editValues.name}`);
        }
        
        // Get storage details from our hook's normalized response
        const { fridgeStorageTime, pantryStorageTime, recommendedMethod, source } = advice;
        
        // Use the storage time for the current section
        const storageTime = section === 'fridge' ? fridgeStorageTime : pantryStorageTime;
        
        // Create source label if available
        const sourceLabel = source ? `, ${source}` : '';
        
        // Capitalize the name
        const capitalizedName = capitalizeWords(editValues.name);
        
        newStorageRecs[section][index] = {
          name: `${capitalizedName} (${storageTime} days${sourceLabel})`,
          quantity: editValues.quantity
        };

        // Update in inventory store
        const location = section === 'fridge' ? 'refrigerator' : 'pantry';
        const existingItem = items.find(item => 
          item.name.toLowerCase() === originalName.toLowerCase() && 
          item.location === location
        );

        if (existingItem) {
          updateItem(existingItem.id, {
            name: capitalizedName,
            quantity: `${editValues.quantity} item${editValues.quantity > 1 ? 's' : ''}`,
            expiryDate: new Date(Date.now() + (Number.isFinite(storageTime) ? storageTime : 7) * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      } catch (err) {
        // If API call fails, keep the original storage time
        const originalDetails = item.name.match(/\((\d+) days(?:, (\w+))?\)/);
        const originalStorageTime = originalDetails?.[1] || '7';
        
        // Capitalize the name
        const capitalizedName = capitalizeWords(editValues.name);
        
        newStorageRecs[section][index] = {
          name: `${capitalizedName} (${originalStorageTime} days)`,
          quantity: editValues.quantity
        };

        // Update in inventory store
        const location = section === 'fridge' ? 'refrigerator' : 'pantry';
        const existingItem = items.find(item => 
          item.name.toLowerCase() === originalName.toLowerCase() && 
          item.location === location
        );

        if (existingItem) {
          updateItem(existingItem.id, {
            name: capitalizedName,
            quantity: `${editValues.quantity} item${editValues.quantity > 1 ? 's' : ''}`,
            expiryDate: new Date(Date.now() + (Number.isFinite(parseInt(originalStorageTime)) ? parseInt(originalStorageTime) : 7) * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }
    } else {
      // If name hasn't changed, update only the quantity
      newStorageRecs[section][index] = {
        name: item.name,
        quantity: editValues.quantity
      };

      // Update quantity in inventory store
      const location = section === 'fridge' ? 'refrigerator' : 'pantry';
      const existingItem = items.find(item => 
        item.name.toLowerCase() === originalName.toLowerCase() && 
        item.location === location
      );

      if (existingItem) {
        updateItem(existingItem.id, {
          quantity: `${editValues.quantity} item${editValues.quantity > 1 ? 's' : ''}`
        });
      }
    }

    onUpdateStorageRecs(newStorageRecs);
    setEditingItem(null);
  };

  /**
   * Deletes an item from storage recommendations and inventory store
   * @param {number} index - Index of the item to delete
   * @param {'fridge' | 'pantry'} section - Storage section containing the item
   */
  const handleDelete = (index: number, section: 'fridge' | 'pantry') => {
    const newStorageRecs = { ...storageRecs };
    
    // Check if the item exists at the specified index
    if (!newStorageRecs[section] || !newStorageRecs[section][index]) {
      console.error(`Item at index ${index} in ${section} not found`);
      return;
    }
    
    const item = newStorageRecs[section][index];
    
    // Check if the item has a name property
    if (!item || !item.name) {
      console.error('Item or item name is undefined', item);
      newStorageRecs[section].splice(index, 1);
      onUpdateStorageRecs(newStorageRecs);
      return;
    }
    
    const itemName = item.name.split(' (')[0];
    
    // Remove from inventory store
    const location = section === 'fridge' ? 'refrigerator' : 'pantry';
    const existingItem = items.find(item => 
      item.name.toLowerCase() === itemName.toLowerCase() && 
      item.location === location
    );

    if (existingItem) {
      removeItem(existingItem.id);
    }

    newStorageRecs[section].splice(index, 1);
    onUpdateStorageRecs(newStorageRecs);
  };

  /**
   * Adds a new item to storage recommendations and inventory store
   * @param {'fridge' | 'pantry'} section - Storage section to add the item to
   */
  const handleAdd = async (section: 'fridge' | 'pantry') => {
    if (!newItem.name.trim()) {
      addToast({
        title: 'Error',
        description: 'Please enter an item name',
        classNames: {
          base: "bg-red-100/70",
          title: "text-red-700 font-medium font-semibold",
          description: "text-red-700",
          icon: "text-red-700"
        }
      });
      return;
    }

    try {
      // Use our custom hook instead of direct axios call
      const advice = await getStorageAdvice(newItem.name);
      
      if (!advice) {
        throw new Error(`Failed to get storage advice for ${newItem.name}`);
      }
      
      // Get storage details from our hook's normalized response
      const { fridgeStorageTime, pantryStorageTime, recommendedMethod, source } = advice;
      
      // Check if recommended location differs from chosen location
      if ((recommendedMethod === 'fridge' && section === 'pantry') || 
          (recommendedMethod === 'pantry' && section === 'fridge')) {
        // Show confirmation modal
        setRecommendationDialog({
          isOpen: true,
          itemName: newItem.name,
          recommendedSection: recommendedMethod,
          userSelectedSection: section,
          fridgeTime: fridgeStorageTime,
          pantryTime: pantryStorageTime,
          sourceLabel: source || '',
          item: { name: newItem.name, quantity: newItem.quantity }
        });
      } else {
        // Use the right storage time for the target location
        const storageTime = section === 'fridge' ? fridgeStorageTime : pantryStorageTime;
        const sourceLabel = source ? `, ${source}` : '';
        
        // Add directly since it's already in the recommended location
        addItemToStorage(newItem.name, section, storageTime, sourceLabel);
      }
    } catch (err) {
      console.error(`Error getting storage advice for ${newItem.name}:`, err);
      
      // Fallback to basic logic
      let storageTime: number;
      
      // Use default times
      storageTime = section === 'fridge' ? 7 : 14;
      
      // Add with default settings
      addItemToStorage(newItem.name, section, storageTime, '');
    }
    
    // Reset input field
    setNewItem({ name: '', quantity: 1 });
  };

  /**
   * Helper function to add item to storage after location is determined
   */
  const addItemToStorage = (itemName: string, section: 'fridge' | 'pantry', storageTime: number, sourceLabel: string) => {
    // Capitalize the item name
    const capitalizedName = capitalizeWords(itemName);
    
    // Create a new storage recs object to update
    const newStorageRecs = { ...storageRecs };
    
    // Check if item already exists in the section - normalize the name for case-insensitive comparison
    const normalizedNewName = capitalizedName.toLowerCase().trim();
    
    const existingItemIndex = newStorageRecs[section].findIndex(item => {
      const existingName = item.name.split(' (')[0].toLowerCase().trim();
      return existingName === normalizedNewName;
    });
    
    // Add to inventory
    const inventoryLocation = section === 'fridge' ? 'refrigerator' : 'pantry';
    
    // Also check if item exists in inventory store - case insensitive search
    const existingInventoryItem = items.find(item => {
      const inventoryName = item.name.toLowerCase().trim();
      return inventoryName === normalizedNewName && item.location === inventoryLocation;
    });
    
    if (existingItemIndex >= 0) {
      // Item exists in storage recommendations, update quantity
      const existingItem = newStorageRecs[section][existingItemIndex];
      const newQuantity = existingItem.quantity + newItem.quantity;
      
      // Update the existing item
      newStorageRecs[section][existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity
      };
      
      // If item also exists in inventory, update quantity there too
      if (existingInventoryItem) {
        // Extract numeric part from quantity strings like "2 items" or "500g"
        const existingQtyMatch = existingInventoryItem.quantity.match(/^(\d+)/);
        const newQtyMatch = (`${newItem.quantity}`).match(/^(\d+)/);
        
        let existingQty = existingQtyMatch ? parseInt(existingQtyMatch[1]) : 1;
        let newQty = newQtyMatch ? parseInt(newQtyMatch[1]) : 1;
        
        // Add quantities
        const totalQty = existingQty + newQty;
        
        // Determine unit from existing item (items, g, kg, etc.)
        const unitMatch = existingInventoryItem.quantity.match(/[^\d\s]+/);
        const unit = unitMatch ? unitMatch[0] : "items";
        
        // Update inventory item
        updateItem(existingInventoryItem.id, {
          ...existingInventoryItem,
          quantity: `${totalQty} ${unit}`
        });
      } else {
        // Add new inventory item
        addItem({
          name: capitalizedName,
          quantity: `${newItem.quantity} item${newItem.quantity > 1 ? 's' : ''}`,
          expiryDate: new Date(Date.now() + storageTime * 24 * 60 * 60 * 1000).toISOString(),
          location: inventoryLocation
        });
      }
      
      addToast({
        title: 'Item Quantity Updated',
        description: `Updated ${capitalizedName} quantity in your ${section === 'fridge' ? 'refrigerator' : 'pantry'}.`,
        classNames: {
          base: "bg-darkgreen/10 border border-darkgreen",
          title: "text-darkgreen font-semibold",
          description: "text-darkgreen",
          icon: "text-darkgreen"
        },
        timeout: 3000
      });
    } else {
      // Add new item to storage recommendations
      newStorageRecs[section].push({
        name: `${capitalizedName} (${storageTime} days${sourceLabel})`,
        quantity: newItem.quantity
      });
      
      // If item exists in inventory but in a different location, update it
      if (existingInventoryItem) {
        updateItem(existingInventoryItem.id, {
          ...existingInventoryItem,
          location: inventoryLocation,
          expiryDate: new Date(Date.now() + storageTime * 24 * 60 * 60 * 1000).toISOString()
        });
      } else {
        // Add new inventory item
        addItem({
          name: capitalizedName,
          quantity: `${newItem.quantity} item${newItem.quantity > 1 ? 's' : ''}`,
          expiryDate: new Date(Date.now() + storageTime * 24 * 60 * 60 * 1000).toISOString(),
          location: inventoryLocation
        });
      }
      
      addToast({
        title: 'Item Added',
        description: `${capitalizedName} has been added to your ${section === 'fridge' ? 'refrigerator' : 'pantry'}.`,
        classNames: {
          base: "bg-darkgreen/10 border border-darkgreen",
          title: "text-darkgreen font-semibold",
          description: "text-darkgreen",
          icon: "text-darkgreen"
        },
        timeout: 3000
      });
    }
    
    // Update state
    onUpdateStorageRecs(newStorageRecs);
    setNewItem({ name: '', quantity: 1 });
    setShowAddForm(null);
  };
  
  /**
   * Handler for recommendation dialog confirmation
   */
  const handleRecommendationConfirm = (selectedSection: 'fridge' | 'pantry') => {
    if (!recommendationDialog) return;
    
    const useRecommended = selectedSection === recommendationDialog.recommendedSection;
    const item = recommendationDialog.item;
    
    // Get the appropriate storage time based on the selected section
    const storageTime = selectedSection === 'fridge' 
      ? recommendationDialog.fridgeTime 
      : recommendationDialog.pantryTime;
    
    // Create a deep copy of the current storage recommendations
    const newStorageRecs = {
      fridge: [...storageRecs.fridge],
      pantry: [...storageRecs.pantry]
    };
    
    // Remove item from both sections to ensure no duplicates
    const sourceSection = recommendationDialog.sourceSection;
    const sourceIndex = recommendationDialog.sourceIndex;
    
    if (sourceSection && sourceIndex !== undefined) {
      newStorageRecs[sourceSection].splice(sourceIndex, 1);
    }
    
    // Add to the selected section
    newStorageRecs[selectedSection].push({
      name: `${item.name} (${storageTime} days)`,
      quantity: item.quantity
    });
    
    // Update the storage recommendations
    onUpdateStorageRecs(newStorageRecs);
    
    // Add to inventory - use existing addItemToStorage function
    addItemToStorage(item.name, selectedSection, storageTime, 'storage_recommendation');
    
    // Close the dialog
    setRecommendationDialog(null);
  };

  /**
   * Handles the start of a drag operation
   * @param {React.DragEvent} e - The drag event
   * @param {number} index - Index of the item being dragged
   * @param {'fridge' | 'pantry'} section - Storage section containing the item
   */
  const handleDragStart = (e: React.DragEvent, index: number, section: 'fridge' | 'pantry') => {
    // Get the item array based on the section
    const itemsArray = storageRecs[section];
    
    // Check if the item exists at the specified index
    if (!itemsArray || !itemsArray[index]) {
      console.error(`Item at index ${index} in ${section} not found for drag operation`);
      return;
    }
    
    const item = itemsArray[index];
    
    // Check if the item has required properties
    if (!item || !item.name) {
      console.error('Item or item properties are undefined', item);
      return;
    }
    
    setDraggedItem({ 
      index, 
      section,
      item // Store the actual item data
    });
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    e.dataTransfer.effectAllowed = 'move';
  };

  /**
   * Handles the drag over event to allow dropping
   * @param {React.DragEvent} e - The drag event
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  /**
   * Handles drop events when items are dragged between storage sections
   * @param {React.DragEvent} e - The drag event
   * @param {'fridge' | 'pantry'} targetSection - Target storage section
   * @param {number} targetIndex - Index where item should be inserted
   */
  const handleDrop = async (e: React.DragEvent, targetSection: 'fridge' | 'pantry', targetIndex?: number) => {
    e.preventDefault();
    
    if (!draggedItem) {
      console.error('No item is being dragged');
      return;
    }
    
    const { index: sourceIndex, section: sourceSection, item: movedItem } = draggedItem;
    

    // Validate moved item
    if (!movedItem || !movedItem.name) {
      console.error('Dragged item or its name is undefined', movedItem);
      setDraggedItem(null);
      return;
    }

    // If dropped in the same position
    if (sourceSection === targetSection && targetIndex !== undefined && sourceIndex === targetIndex) return;
    
    // Create a deep copy of the current storage recommendations
    const newStorageRecs = JSON.parse(JSON.stringify(storageRecs));
    

    // Check if source section exists
    if (!newStorageRecs[sourceSection] || !newStorageRecs[sourceSection][sourceIndex]) {
      console.error(`Source item at index ${sourceIndex} in ${sourceSection} not found`);
      setDraggedItem(null);
      return;
    }
    

    // Get the item name without storage time info
    const itemName = movedItem.name?.split(' (')[0] || '';
    
    try {
      // Use our custom hook instead of direct axios call
      const advice = await getStorageAdvice(itemName);
      
      if (!advice) {
        throw new Error(`Failed to get storage advice for ${itemName}`);
      }
      
      // Determine the new storage time based on the target location
      let newStorageTime: number; 
      let sourceLabel = '';
      
      // Get storage times from our hook's normalized response
      const { fridgeStorageTime, pantryStorageTime, source } = advice;
      
      // Use the correct time based on target location
      newStorageTime = targetSection === 'fridge' ? fridgeStorageTime : pantryStorageTime;
      
      // Add source label if available
      sourceLabel = source ? `, ${source}` : '';
      
      // Remove the item from source section
      newStorageRecs[sourceSection].splice(sourceIndex, 1);
      
      // If targetIndex is undefined, append to the end of the target section
      const insertIndex = targetIndex !== undefined ? targetIndex : newStorageRecs[targetSection].length;
      
      // Capitalize item name
      const capitalizedItemName = capitalizeWords(itemName);
      
      // Update the item with new storage time before inserting
      const updatedItem = {
        ...movedItem,
        name: `${capitalizedItemName} (${newStorageTime} days${sourceLabel})`
      };
      
      // Insert the updated item at the destination
      newStorageRecs[targetSection].splice(insertIndex, 0, updatedItem);
      
      // Update the local state
      onUpdateStorageRecs(newStorageRecs);

      // Update the inventory store
      const sourceLocation = sourceSection === 'fridge' ? 'refrigerator' : 'pantry';
      const targetLocation = targetSection === 'fridge' ? 'refrigerator' : 'pantry';
      
      // Find the item in the inventory store
      const existingItem = items.find(item => 
        item.name.toLowerCase() === itemName.toLowerCase() && 
        item.location === sourceLocation
      );

      if (existingItem) {
        // Update the item's location and expiry date with the correct storage time
        updateItem(existingItem.id, {
          location: targetLocation,
          expiryDate: new Date(Date.now() + newStorageTime * 24 * 60 * 60 * 1000).toISOString(),
          daysLeft: newStorageTime
        });
      }
      
    } catch (error) {
      console.error(`Error getting storage advice for ${itemName}:`, error);
      
      // Fall back to simpler approach if API fails
      // Remove the item from source section
      newStorageRecs[sourceSection].splice(sourceIndex, 1);
      
      // If targetIndex is undefined, append to the end of the target section
      const insertIndex = targetIndex !== undefined ? targetIndex : newStorageRecs[targetSection].length;
      
      // Insert the item at the destination
      newStorageRecs[targetSection].splice(insertIndex, 0, movedItem);
      
      // Update the local state first
      onUpdateStorageRecs(newStorageRecs);

      // Update the Zustand store with default values
      const defaultDays = targetSection === 'fridge' ? 7 : 14;
      const sourceLocation = sourceSection === 'fridge' ? 'refrigerator' : 'pantry';
      const targetLocation = targetSection === 'fridge' ? 'refrigerator' : 'pantry';
      
      // Find the item in the inventory store
      const existingItem = items.find(item => 
        item.name.toLowerCase() === itemName.toLowerCase() && 
        item.location === sourceLocation
      );

      if (existingItem) {
        // Update the item's location and expiry date
        updateItem(existingItem.id, {
          location: targetLocation,
          expiryDate: new Date(Date.now() + defaultDays * 24 * 60 * 60 * 1000).toISOString(),
          daysLeft: defaultDays
        });
      }
    }
    
    // Reset dragged item
    setDraggedItem(null);
  };

  /**
   * Renders the list of items for a given storage section
   * @param {Array<{name: string; quantity: number}>} items - Array of items to render
   * @param {'fridge' | 'pantry'} section - Storage section to render items for
   * @returns {JSX.Element} The rendered item list
   */
  const renderItemList = (items: Array<{ name: string; quantity: number }>, section: 'fridge' | 'pantry') => {
    return (
      <ul 
        className="space-y-3 max-h-[400px] overflow-y-auto pr-2"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, section)}
      >
        {items.map((item, index) => {
          // Skip rendering if item or item.name is undefined
          if (!item || !item.name) {
            console.warn(`Skipping item at index ${index} because it's undefined or has no name property`);
            return null;
          }

          // Extract the item details with updated regex to handle source as well
          // Only capture days, ignore source
          const detailsMatch = item.name.match(/\((\d+) days(?:, (?:\w+))?\)/);
          const days = detailsMatch ? detailsMatch[1] : '7';
          
          // Get item name without the days info
          const itemName = item.name.split(' (')[0];
          
          // Capitalize the item name
          const capitalizedName = capitalizeWords(itemName);
          
          // Simplified storage label without source
          const storageLabel = `${days} days`;
          
          // Create a more unique key that combines section, name and index
          const uniqueKey = `${section}-${itemName.toLowerCase()}-${index}`;
          
          if (editingItem?.index === index && editingItem?.section === section) {
            return (
              <li key={uniqueKey} className={`flex items-center p-3 rounded-lg ${section === 'fridge' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                <input
                  type="text"
                  value={editValues.name}
                  onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                  className="flex-grow mr-2 p-1 rounded"
                />
                <input
                  type="number"
                  value={editValues.quantity}
                  onChange={(e) => setEditValues({ ...editValues, quantity: parseInt(e.target.value) || 1 })}
                  className="w-20 mr-2 p-1 rounded"
                  min="1"
                />
                <button onClick={() => handleSave(index, section)} className="text-green-500 mr-2">
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <button onClick={() => setEditingItem(null)} className="text-red-500">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </li>
            );
          }

          return (
            <li 
              key={uniqueKey}
              className={`flex items-center p-3 rounded-lg ${section === 'fridge' ? 'bg-blue-100' : 'bg-amber-100'} cursor-move`}
              draggable
              onDragStart={(e) => handleDragStart(e, index, section)}
              onDragOver={handleDragOver}
              onDrop={(e) => {
                e.stopPropagation(); // Prevent event from bubbling up
                handleDrop(e, section, index);
              }}
            >
              <div className="grid grid-cols-3 w-full items-center">
                <div className="text-left">{capitalizedName}</div>
                <div className="text-center text-gray-600">Qty: {item.quantity}</div>
                <div className="text-right text-gray-600">Storage: {storageLabel}</div>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => handleEdit(index, section)} className="text-blue-500">
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button onClick={() => handleDelete(index, section)} className="text-red-500">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-2 gap-8">
      {/* Recommendation Dialog */}
      <Modal 
        isOpen={recommendationDialog !== null} 
        onClose={() => setRecommendationDialog(null)}
        size="md"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold text-darkgreen">Storage Recommendation</h3>
          </ModalHeader>
          <ModalBody>
            {recommendationDialog && (
              <div className="space-y-4">
                <p>
                  <span className="font-semibold">{recommendationDialog.itemName}</span> is recommended 
                  to be stored in the <span className="font-semibold text-amber-700">
                    {recommendationDialog.recommendedSection === 'fridge' ? 'refrigerator' : 'pantry'}
                  </span>.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <button 
                    onClick={() => handleRecommendationConfirm('fridge')} 
                    className={`border rounded-lg text-center p-4 transition-all hover:shadow-md ${
                      recommendationDialog.recommendedSection === 'fridge' 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                      : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <p className="font-semibold text-blue-700">Refrigerator</p>
                    <p className="mt-2 text-blue-700 text-lg font-bold">{recommendationDialog.fridgeTime} days</p>
                    <p className="text-sm text-blue-600">storage time</p>
                    {recommendationDialog.recommendedSection === 'fridge' && (
                      <div className="mt-2 py-1 bg-blue-100 rounded-full text-xs font-medium text-blue-700">
                        Recommended
                      </div>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => handleRecommendationConfirm('pantry')} 
                    className={`border rounded-lg text-center p-4 transition-all hover:shadow-md ${
                      recommendationDialog.recommendedSection === 'pantry' 
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500' 
                      : 'border-amber-200 bg-amber-50'
                    }`}
                  >
                    <p className="font-semibold text-amber-700">Pantry</p>
                    <p className="mt-2 text-amber-700 text-lg font-bold">{recommendationDialog.pantryTime} days</p>
                    <p className="text-sm text-amber-600">storage time</p>
                    {recommendationDialog.recommendedSection === 'pantry' && (
                      <div className="mt-2 py-1 bg-amber-100 rounded-full text-xs font-medium text-amber-700">
                        Recommended
                      </div>
                    )}
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Click on your preferred storage location
                </p>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {noItemsDetected && (
        <div className="col-span-2 bg-amber-100/50 border-l-4 border-amber-500 text-amber-700 p-4 mb-4 rounded">
          <p className="font-bold">No Items in Inventory!</p>
          <p>Please scan your groceries again or input items manually.</p>
        </div>
      )}
      {/* Refrigerator section */}
      <div 
        className="bg-white/70 rounded-lg p-5 min-h-[360px] order-1"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'fridge')}
      >
        <h3 className="text-xl font-medium text-gray-700 mb-4 pb-2 border-b-2 border-blue-500">
          <p className="font-semibold text-blue-600">Refrigerator</p>
        </h3>
        {storageRecs.fridge.length > 0 ? (
          renderItemList(storageRecs.fridge, 'fridge')
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-gray-100">
              <FontAwesomeIcon icon={faSnowflake} className="text-gray-400 text-3xl" />
            </div>
            <p className="text-gray-500 italic mb-4">
              No item recommended for refrigerator
            </p>
          </div>
        )}
        <Button
          onPress={() => setShowAddForm({ section: 'fridge' })}
          className="mt-4 text-blue-500 flex items-center bg-transparent border-none"
        > 
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Item
        </Button>
        {showAddForm?.section === 'fridge' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <Input
              classNames={{
                inputWrapper: "bg-white border-1",
              }}
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full mb-2 rounded"
            />
            <Input
              classNames={{
                inputWrapper: "bg-white border-1",
              }}
              type="number"
              placeholder="Quantity"
              value={newItem.quantity.toString()}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              className="w-full mb-2 rounded"
              min="1"
            />
            <div className="flex justify-end">
              <Button
                onPress={() => handleAdd('fridge')}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Add
              </Button>
              <Button
                onPress={() => setShowAddForm(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Pantry section */}
      <div 
        className="bg-white/70 rounded-lg p-5 min-h-[360px] order-2"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'pantry')}
      >
        <h3 className="text-xl font-medium text-gray-700 mb-4 pb-2 border-b-2 border-amber-700">
          <p className="font-semibold text-amber-700">Pantry</p>
        </h3>
        {storageRecs.pantry.length > 0 ? (
          renderItemList(storageRecs.pantry, 'pantry')
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-gray-100">
              <FontAwesomeIcon icon={faBoxOpen} className="text-gray-400 text-3xl" />
            </div>
            <p className="text-gray-500 italic mb-4">
              No item recommended for pantry
            </p>
          </div>
        )}
        <Button
          onPress={() => setShowAddForm({ section: 'pantry' })}
          className="mt-4 text-amber-700 flex items-center bg-transparent border-none"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Item
        </Button>
        {showAddForm?.section === 'pantry' && (
          <div className="mt-4 p-4 bg-amber-50 rounded-lg">
            <Input
              classNames={{
                inputWrapper: "bg-white border-1",
              }}
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full mb-2 rounded"
            />
            <Input
              classNames={{
                inputWrapper: "bg-white border-1",
              }}
              type="number"
              placeholder="Quantity"
              value={newItem.quantity.toString()}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              className="w-full mb-2 rounded"
              min="1"
            />
            <div className="flex justify-end">
              <Button
                onPress={() => handleAdd('pantry')}
                className="bg-amber-700 text-white px-4 py-2 rounded mr-2"
              >
                Add
              </Button>
              <Button
                onPress={() => setShowAddForm(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageRecommendations; 