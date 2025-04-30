import React, { useState, useEffect } from 'react';
import { StorageRecommendation } from '../interfaces';
import { faSnowflake, faBoxOpen, faPlus, faTrash, faEdit, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@mui/material';
import axios from 'axios';
import { config } from '@/config';

// Define the response type for storage advice API
interface StorageAdviceResponse {
  type: string;
  storage_time: number;
  method: number;
}

interface StorageRecommendationsProps {
  storageRecs: StorageRecommendation;
  onUpdateStorageRecs: (newStorageRecs: StorageRecommendation) => void;
}

const StorageRecommendations: React.FC<StorageRecommendationsProps> = ({ storageRecs, onUpdateStorageRecs }) => {
  const [editingItem, setEditingItem] = useState<{ index: number; section: 'fridge' | 'pantry' } | null>(null);
  const [newItem, setNewItem] = useState<{ name: string; quantity: number }>({ name: '', quantity: 1 });
  const [showAddForm, setShowAddForm] = useState<{ section: 'fridge' | 'pantry' } | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; quantity: number }>({ name: '', quantity: 1 });
  const [localStorageRecs, setLocalStorageRecs] = useState<StorageRecommendation>(storageRecs);
  const [draggedItem, setDraggedItem] = useState<{ index: number; section: 'fridge' | 'pantry' } | null>(null);

  // Update local state when props change
  useEffect(() => {
    setLocalStorageRecs(storageRecs);
  }, [storageRecs]);

  // Check if both sections are empty
  const noItemsDetected = localStorageRecs.fridge.length === 0 && localStorageRecs.pantry.length === 0;

  const handleEdit = (index: number, section: 'fridge' | 'pantry') => {
    const item = localStorageRecs[section][index];
    const itemName = item.name.split(' (')[0];
    setEditValues({ name: itemName, quantity: item.quantity });
    setEditingItem({ index, section });
  };

  const handleSave = async (index: number, section: 'fridge' | 'pantry') => {
    const newStorageRecs = { ...localStorageRecs };
    const item = newStorageRecs[section][index];
    const originalName = item.name.split(' (')[0];
    
    // If name changed, try to get storage time from API
    if (editValues.name !== originalName) {
      try {
        const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
          food_type: editValues.name
        });
        const storageTime = response.data.storage_time;
        newStorageRecs[section][index] = {
          name: `${editValues.name} (${storageTime} days)`,
          quantity: editValues.quantity
        };
      } catch {
        // If API call fails, keep the original storage time
        const originalStorageTime = item.name.match(/\((\d+) days\)/)?.[1] || '7';
        newStorageRecs[section][index] = {
          name: `${editValues.name} (${originalStorageTime} days)`,
          quantity: editValues.quantity
        };
      }
    } else {
      newStorageRecs[section][index] = {
        name: item.name,
        quantity: editValues.quantity
      };
    }

    setLocalStorageRecs(newStorageRecs);
    onUpdateStorageRecs(newStorageRecs);
    setEditingItem(null);
  };

  const handleDelete = (index: number, section: 'fridge' | 'pantry') => {
    const newStorageRecs = { ...localStorageRecs };
    newStorageRecs[section].splice(index, 1);
    setLocalStorageRecs(newStorageRecs);
    onUpdateStorageRecs(newStorageRecs);
  };

  const handleAdd = async (section: 'fridge' | 'pantry') => {
    if (!newItem.name) return;

    try {
      const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
        food_type: newItem.name
      });
      const storageTime = response.data.storage_time;
      const newStorageRecs = { ...localStorageRecs };
      
      // Check if item already exists in the section
      const existingItem = newStorageRecs[section].find(item => 
        item.name.split(' (')[0].toLowerCase() === newItem.name.toLowerCase()
      );
      
      if (existingItem) {
        // If item exists, update its quantity
        existingItem.quantity += newItem.quantity;
      } else {
        // If item doesn't exist, add it
        newStorageRecs[section].push({
          name: `${newItem.name} (${storageTime} days)`,
          quantity: newItem.quantity
        });
      }
      
      setLocalStorageRecs(newStorageRecs);
      onUpdateStorageRecs(newStorageRecs);
    } catch {
      // If API call fails, use default storage time
      const newStorageRecs = { ...localStorageRecs };
      
      // Check if item already exists in the section
      const existingItem = newStorageRecs[section].find(item => 
        item.name.split(' (')[0].toLowerCase() === newItem.name.toLowerCase()
      );
      
      if (existingItem) {
        // If item exists, update its quantity
        existingItem.quantity += newItem.quantity;
      } else {
        // If item doesn't exist, add it
        newStorageRecs[section].push({
          name: `${newItem.name} (7 days)`,
          quantity: newItem.quantity
        });
      }
      
      setLocalStorageRecs(newStorageRecs);
      onUpdateStorageRecs(newStorageRecs);
    }

    setNewItem({ name: '', quantity: 1 });
    setShowAddForm(null);
  };

  // Native HTML5 drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number, section: 'fridge' | 'pantry') => {
    setDraggedItem({ index, section });
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSection: 'fridge' | 'pantry', targetIndex?: number) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    const { index: sourceIndex, section: sourceSection } = draggedItem;
    
    // If dropped in the same position
    if (sourceSection === targetSection && targetIndex !== undefined && sourceIndex === targetIndex) return;
    
    // Create a deep copy of the current storage recommendations
    const newStorageRecs = JSON.parse(JSON.stringify(localStorageRecs));
    
    // Get the item being moved
    const [movedItem] = newStorageRecs[sourceSection].splice(sourceIndex, 1);
    
    // If targetIndex is undefined, append to the end of the target section
    const insertIndex = targetIndex !== undefined ? targetIndex : newStorageRecs[targetSection].length;
    
    // Insert the item at the destination
    newStorageRecs[targetSection].splice(insertIndex, 0, movedItem);
    
    // Update the local state first
    setLocalStorageRecs(newStorageRecs);
    
    // Then update the parent component
    onUpdateStorageRecs(newStorageRecs);
    
    // Reset dragged item
    setDraggedItem(null);
  };

  const renderItemList = (items: Array<{ name: string; quantity: number }>, section: 'fridge' | 'pantry') => {
    return (
      <ul 
        className="space-y-3 max-h-[400px] overflow-y-auto pr-2"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, section)}
      >
        {items.map((item, index) => {
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
        {localStorageRecs.fridge.length > 0 ? (
          renderItemList(localStorageRecs.fridge, 'fridge')
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
        {localStorageRecs.pantry.length > 0 ? (
          renderItemList(localStorageRecs.pantry, 'pantry')
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