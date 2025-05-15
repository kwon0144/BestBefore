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

import React, { useState } from 'react';
import { StorageRecommendation, StorageAdviceResponse } from '../interfaces';
import { faSnowflake, faBoxOpen, faPlus, faTrash, faEdit, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { config } from '@/config';
import { addToast, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import useInventoryStore, { FoodItem } from '@/store/useInventoryStore';

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
  const [recommendationDialog, setRecommendationDialog] = useState<{
    isOpen: boolean;
    itemName: string;
    recommendedSection: 'fridge' | 'pantry';
    userSelectedSection: 'fridge' | 'pantry';
    fridgeTime: number;
    pantryTime: number;
    sourceLabel: string;
  } | null>(null);

  // Get inventory store functions
  const { items, addItem, updateItem, removeItem } = useInventoryStore();

  // Check if both sections are empty
  const noItemsDetected = storageRecs.fridge.length === 0 && storageRecs.pantry.length === 0;

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
   * Saves the edited item and updates both local state and inventory store
   * @param {number} index - Index of the item being saved
   * @param {'fridge' | 'pantry'} section - Storage section containing the item
   */
  const handleSave = async (index: number, section: 'fridge' | 'pantry') => {
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
      setEditingItem(null);
      return;
    }
    
    const originalName = item.name.split(' (')[0];
    
    // If name changed, try to get storage time from API
    if (editValues.name !== originalName) {
      try {
        // Call the unified storage-advice endpoint (handles database and Claude fallback)
        const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
          food_type: editValues.name
        });
        
        // Process recommendation
        const recommendation = response.data;
        let storageTime: number;
        let sourceLabel: string;
        
        // Determine storage time based on response format
        if (typeof recommendation.method === 'number') {
          // Database-style response
          const methodValue = recommendation.method === 1 ? 'fridge' : 'pantry';
          storageTime = methodValue === 'fridge' 
            ? Number(recommendation.fridge) || 7 
            : Number(recommendation.pantry) || 14;
        } else if (typeof recommendation.days === 'number') {
          // Claude-style response
          storageTime = recommendation.days;
        } else {
          // Fallback
          storageTime = 7;
        }
        
        // Create source label if available
        sourceLabel = recommendation.source 
          ? `, ${recommendation.source}` 
          : '';
        
        newStorageRecs[section][index] = {
          name: `${editValues.name} (${storageTime} days${sourceLabel})`,
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
            name: editValues.name,
            quantity: `${editValues.quantity} item${editValues.quantity > 1 ? 's' : ''}`,
            expiryDate: new Date(Date.now() + (Number.isFinite(storageTime) ? storageTime : 7) * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      } catch (err) {
        // If API call fails, keep the original storage time
        const originalDetails = item.name.match(/\((\d+) days(?:, (\w+))?\)/);
        const originalStorageTime = originalDetails?.[1] || '7';
        const originalSource = originalDetails?.[2] || '';
        const sourceLabel = originalSource ? `, ${originalSource}` : '';
        
        newStorageRecs[section][index] = {
          name: `${editValues.name} (${originalStorageTime} days${sourceLabel})`,
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
            name: editValues.name,
            quantity: `${editValues.quantity} item${editValues.quantity > 1 ? 's' : ''}`,
            expiryDate: new Date(Date.now() + (Number.isFinite(parseInt(originalStorageTime)) ? parseInt(originalStorageTime) : 7) * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }
    } else {
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
      // Call the unified storage-advice endpoint (handles database and Claude fallback)
      const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
        food_type: newItem.name
      });
      
      // Process recommendation
      const recommendation = response.data;
      let recommendedMethod: 'fridge' | 'pantry' = 'pantry'; // Default method
      
      // Extract the storage times for both locations
      const fridgeTime = Number(recommendation.fridge) || 7; // Default fridge time
      const pantryTime = Number(recommendation.pantry) || 14; // Default pantry time
      
      // Determine the recommended method based on response format
      if (typeof recommendation.method === 'number') {
        // Database-style response
        recommendedMethod = recommendation.method === 1 ? 'fridge' : 'pantry';
      } else if (typeof recommendation.method === 'string') {
        // Claude-style response with string method
        recommendedMethod = recommendation.method === 'fridge' ? 'fridge' : 'pantry';
      }
      
      // Create source label if available
      const sourceLabel = recommendation.source 
        ? `, ${recommendation.source}` 
        : '';
      
      // If API recommends a different storage location than what user selected,
      // show the recommendation dialog instead of a popup
      if (recommendedMethod !== section) {
        setRecommendationDialog({
          isOpen: true,
          itemName: newItem.name,
          recommendedSection: recommendedMethod,
          userSelectedSection: section,
          fridgeTime,
          pantryTime,
          sourceLabel
        });
        return; // Wait for user decision via dialog
      }
      
      // If recommendation matches user's selection, proceed directly
      addItemToStorage(newItem.name, section, section === 'fridge' ? fridgeTime : pantryTime, sourceLabel);
      
    } catch (error) {
      console.error('Error adding item:', error);
      
      // Default fallback for errors
      const defaultStorageTime = section === 'fridge' ? 7 : 14;
      
      // Add to inventory even with error
      addItemToStorage(newItem.name, section, defaultStorageTime, ', default');
    }
  };

  /**
   * Helper function to add item to storage after location is determined
   */
  const addItemToStorage = (itemName: string, section: 'fridge' | 'pantry', storageTime: number, sourceLabel: string) => {
    // Add to inventory
    const inventoryLocation = section === 'fridge' ? 'refrigerator' : 'pantry';
    addItem({
      name: itemName,
      quantity: `${newItem.quantity} item${newItem.quantity > 1 ? 's' : ''}`,
      expiryDate: new Date(Date.now() + storageTime * 24 * 60 * 60 * 1000).toISOString(),
      location: inventoryLocation
    });
    
    // Add to local storage recs
    const newStorageRecs = { ...storageRecs };
    newStorageRecs[section].push({
      name: `${itemName} (${storageTime} days${sourceLabel})`,
      quantity: newItem.quantity
    });
    
    onUpdateStorageRecs(newStorageRecs);
    setNewItem({ name: '', quantity: 1 });
    setShowAddForm(null);
    
    addToast({
      title: 'Item Added',
      description: `${itemName} has been added to your ${section === 'fridge' ? 'refrigerator' : 'pantry'}.`,
      classNames: {
        base: "bg-green-50",
        title: "text-green-700 font-medium font-semibold",
        description: "text-green-700",
        icon: "text-green-700"
      },
      timeout: 3000
    });
  };
  
  /**
   * Handler for recommendation dialog confirmation
   */
  const handleRecommendationConfirm = (useRecommended: boolean) => {
    if (!recommendationDialog) return;
    
    const { 
      itemName, 
      recommendedSection,
      userSelectedSection,
      fridgeTime,
      pantryTime,
      sourceLabel
    } = recommendationDialog;
    
    // Use either the recommended location or user's original choice
    const finalSection = useRecommended ? recommendedSection : userSelectedSection;
    const storageTime = finalSection === 'fridge' ? fridgeTime : pantryTime;
    
    // Add the item with the chosen location
    addItemToStorage(itemName, finalSection, storageTime, sourceLabel);
    
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
   * Handles the drop operation for drag and drop functionality
   * @param {React.DragEvent} e - The drag event
   * @param {'fridge' | 'pantry'} targetSection - Target storage section
   * @param {number} [targetIndex] - Optional target index for insertion
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
      // Get the correct storage time for the target location from the API
      const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
        food_type: itemName
      });
      
      // Determine the new storage time based on the target location
      let newStorageTime: number; 
      let sourceLabel = '';
      
      if (response.data) {
        // Get storage times from API response
        const fridgeTime = Number(response.data.fridge) || 7;
        const pantryTime = Number(response.data.pantry) || 14;
        
        // Use the correct time based on target location
        newStorageTime = targetSection === 'fridge' ? fridgeTime : pantryTime;
        
        // Add source label if available
        sourceLabel = response.data.source ? `, ${response.data.source}` : '';
      } else {
        // Fallback if API fails
        newStorageTime = targetSection === 'fridge' ? 7 : 14;
        sourceLabel = ', default';
      }
      
      console.log(`Moving ${itemName} to ${targetSection}:`, {
        targetSection,
        newStorageTime,
        sourceLabel
      });
      
      // Remove the item from source section
      newStorageRecs[sourceSection].splice(sourceIndex, 1);
      
      // If targetIndex is undefined, append to the end of the target section
      const insertIndex = targetIndex !== undefined ? targetIndex : newStorageRecs[targetSection].length;
      
      // Update the item with new storage time before inserting
      const updatedItem = {
        ...movedItem,
        name: `${itemName} (${newStorageTime} days${sourceLabel})`
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
          const detailsMatch = item.name.match(/\((\d+) days(?:, (\w+))?\)/);
          const days = detailsMatch ? detailsMatch[1] : '7';
          const source = detailsMatch && detailsMatch[2] ? detailsMatch[2] : '';
          const itemName = item.name.split(' (')[0];
          
          // Storage label with source if available
          const storageLabel = source ? `${days} days, ${source}` : `${days} days`;
          
          if (editingItem?.index === index && editingItem?.section === section) {
            return (
              <li key={index} className={`flex items-center p-3 rounded-lg ${section === 'fridge' ? 'bg-blue-100' : 'bg-amber-100'}`}>
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
              key={index} 
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
                <div className="text-left">{itemName}</div>
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
                  <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg text-center">
                    <p className="font-semibold text-blue-700">Refrigerator</p>
                    <p className="mt-2 text-blue-700 text-lg font-bold">{recommendationDialog.fridgeTime} days</p>
                    <p className="text-sm text-blue-600">storage time</p>
                  </div>
                  
                  <div className="border border-amber-200 bg-amber-50 p-4 rounded-lg text-center">
                    <p className="font-semibold text-amber-700">Pantry</p>
                    <p className="mt-2 text-amber-700 text-lg font-bold">{recommendationDialog.pantryTime} days</p>
                    <p className="text-sm text-amber-600">storage time</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-2">
                  Would you like to use the recommended storage location or continue with your selection?
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="light" 
              onPress={() => handleRecommendationConfirm(false)}
              className="mr-2"
            >
              Use My Selection
            </Button>
            <Button 
              color="primary"
              onPress={() => handleRecommendationConfirm(true)}
              className="bg-darkgreen hover:bg-darkgreen/90"
            >
              Use Recommendation
            </Button>
          </ModalFooter>
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
              No items recommended for refrigerator
            </p>
          </div>
        )}
        <button
          onClick={() => setShowAddForm({ section: 'fridge' })}
          className="mt-4 text-blue-500 flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Item
        </button>
        {showAddForm?.section === 'fridge' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full mb-2 p-2 rounded"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              className="w-full mb-2 p-2 rounded"
              min="1"
            />
            <div className="flex justify-end">
              <button
                onClick={() => handleAdd('fridge')}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
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
              No items recommended for pantry
            </p>
          </div>
        )}
        <button
          onClick={() => setShowAddForm({ section: 'pantry' })}
          className="mt-4 text-amber-700 flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Item
        </button>
        {showAddForm?.section === 'pantry' && (
          <div className="mt-4 p-4 bg-amber-50 rounded-lg">
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full mb-2 p-2 rounded"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              className="w-full mb-2 p-2 rounded"
              min="1"
            />
            <div className="flex justify-end">
              <button
                onClick={() => handleAdd('pantry')}
                className="bg-amber-700 text-white px-4 py-2 rounded mr-2"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageRecommendations; 