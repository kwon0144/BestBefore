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
import { addToast } from '@heroui/react';
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
        const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage_assistant/`, {
          produce_name: editValues.name
        });

        const storageTime = response.data.days;
        newStorageRecs[section][index] = {
          name: `${editValues.name} (${storageTime} days)`,
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
            expiryDate: new Date(Date.now() + storageTime * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      } catch {
        // If API call fails, keep the original storage time
        const originalStorageTime = item.name.match(/\((\d+) days\)/)?.[1] || '7';
        newStorageRecs[section][index] = {
          name: `${editValues.name} (${originalStorageTime} days)`,
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
            expiryDate: new Date(Date.now() + parseInt(originalStorageTime) * 24 * 60 * 60 * 1000).toISOString()
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
    if (!newItem.name) return;


    let storageTime = 21; // Default storage time
    let actualSection = section; // The section may change based on API recommendation


    try {
      // First try to get storage advice from API
      try {
        const response = await axios.post<StorageAdviceResponse>(

          `${config.apiUrl}/api/storage_assistant/`,
          {
            produce_name: newItem.name

          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },

            timeout: 3000 // 3 second timeout

          }
        );

        if (response.data) {

          storageTime = response.data.days;
          
          // If section doesn't match the recommendation, override the section
          if ((response.data.method === 'fridge' && section !== 'fridge') ||
            (response.data.method === 'pantry' && section !== 'pantry')) {
            // Use recommended section instead
            actualSection = response.data.method;
            
            // Show toast notification about the correction
            addToast({
              title: "Storage Location Corrected",
              description: `"${newItem.name}" is best stored in the ${response.data.method}`,
              classNames: {
                base: "bg-blue-100/70",
                title: "text-blue-700 font-medium font-semibold",
                description: "text-blue-700",
                icon: "text-blue-700"
              },
              timeout: 3000
            });
          }

        }
      } catch (apiError: unknown) {
        if (apiError && typeof apiError === 'object' && 'code' in apiError && apiError.code === 'ECONNABORTED') {
          // Silently handle timeout errors
        } else {
          // Silently handle other API errors

          console.error("Error getting storage advice:", apiError);
        }
      }
    

      // Add to inventory store with the correct storage time
      const addedItem: Omit<FoodItem, 'id'> = {
        name: newItem.name,
        quantity: `${newItem.quantity} item${newItem.quantity > 1 ? 's' : ''}`,

        location: (actualSection === 'fridge' ? 'refrigerator' : 'pantry') as 'refrigerator' | 'pantry',
        expiryDate: new Date(Date.now() + storageTime * 24 * 60 * 60 * 1000).toISOString()
      };
      addItem(addedItem);
      
      // Update storageRecs state
      const newStorageRecs = { ...storageRecs };
      const newItemForDisplay = {
        name: `${newItem.name} (${storageTime} days)`,
        quantity: newItem.quantity
      };
      
      newStorageRecs[actualSection] = [...newStorageRecs[actualSection], newItemForDisplay];
      onUpdateStorageRecs(newStorageRecs);
      
    } catch (error) {
      // Handle any other errors
      console.error("Error adding item:", error);
      addToast({
        title: "Error Adding Item",
        description: "There was a problem adding the item. Please try again.",
        classNames: {
          base: "bg-red-100/70",
          title: "text-red-700 font-medium font-semibold",
          description: "text-red-700",
          icon: "text-red-700"
        },
        timeout: 3000
      });

    }

    // Reset form state and close the form
    setNewItem({ name: '', quantity: 1 });
    setShowAddForm(null);
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
  const handleDrop = (e: React.DragEvent, targetSection: 'fridge' | 'pantry', targetIndex?: number) => {
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
    

    // Remove the item from source section
    newStorageRecs[sourceSection].splice(sourceIndex, 1);
    
    // If targetIndex is undefined, append to the end of the target section
    const insertIndex = targetIndex !== undefined ? targetIndex : newStorageRecs[targetSection].length;
    
    // Insert the item at the destination
    newStorageRecs[targetSection].splice(insertIndex, 0, movedItem);
    
    // Update the local state first
    onUpdateStorageRecs(newStorageRecs);

    // Update the Zustand store
    const itemName = movedItem.name?.split(' (')[0] || '';
    const daysMatch = movedItem.name?.match(/\((\d+) days\)/);
    const days = daysMatch ? parseInt(daysMatch[1]) : 7;
    const location = targetSection === 'fridge' ? 'refrigerator' : 'pantry';
    
    // Find the item in the inventory store
    const existingItem = items.find(item => 
      item.name.toLowerCase() === itemName.toLowerCase() && 
      item.location === (sourceSection === 'fridge' ? 'refrigerator' : 'pantry')
    );

    if (existingItem) {
      // Update the item's location and expiry date
      updateItem(existingItem.id, {
        location: location,
        expiryDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      });
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

          const days = item.name.match(/\((\d+) days\)/)?.[1] || '';
          const itemName = item.name.replace(/ \(\d+ days\)/, '');
          
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
                <div className="text-right text-gray-600">Storage: {days} days</div>
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