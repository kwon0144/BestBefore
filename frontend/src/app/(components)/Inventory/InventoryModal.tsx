/**
 * This component provides a modal interface for managing food inventory.
 * It allows users to add, edit, and remove food items from their refrigerator and pantry,
 * with intelligent recommendations for storage locations and expiry dates based on food types.
 */
import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@heroui/react";
import { FoodItem } from "@/store/useInventoryStore";
import useInventoryStore from "@/store/useInventoryStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { config } from "@/config";

/**
 * Props for the InventoryModal component
 * @interface
 */
type InventoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Type for storage recommendation from the API
 * @interface
 */
type StorageAdviceResponse = {
  type: string;
  storage_time: number;
  method: number; // 1 for refrigerator, 0 for pantry
};

/**
 * Type for food types API response
 * @interface
 */
type FoodTypesResponse = {
  food_types: string[];
};

/**
 * Modal component for managing food inventory
 * Provides UI for adding, editing, and removing food items with expiry date tracking
 * @param {InventoryModalProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export default function InventoryModal({ isOpen, onClose }: InventoryModalProps) {
  const { items, addItem, updateItem, removeItem, getItemsByLocation, clearAll } = useInventoryStore();
  const [selectedTab, setSelectedTab] = useState<string>("refrigerator");
  const [isEditing, setIsEditing] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<FoodItem | null>(null);
  const [isFetchingRecommendation, setIsFetchingRecommendation] = useState(false);
  const [foodTypeOptions, setFoodTypeOptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Form state
  const [formState, setFormState] = useState<Omit<FoodItem, "id" | "daysLeft">>({
    name: "",
    quantity: "",
    location: null as unknown as "refrigerator" | "pantry", // Default to not selected
    expiryDate: "", // Default to not selected
  });

  /**
   * Fetches food types from the API when the component mounts
   */
  useEffect(() => {
    if (isOpen) {
      fetchFoodTypes();
    }
  }, [isOpen]);

  /**
   * Fetches all available food types from the API
   */
  const fetchFoodTypes = async () => {
    try {
      const response = await axios.get<FoodTypesResponse>(`${config.apiUrl}/api/food-types/`);
      if (response.data && response.data.food_types) {
        setFoodTypeOptions(response.data.food_types);
      }
    } catch {
      setError("Failed to load food types from the database.");
    }
  };

  /**
   * Gets storage time recommendation for a food type from the API
   * @param {string} foodName - Name of the food to get storage advice for
   * @returns {Promise<{storage_time: number; method: number}>} Storage time and method recommendation
   */
  const getStorageTime = async (foodName: string): Promise<{storage_time: number; method: number}> => {
    try {
      setIsFetchingRecommendation(true);
      
      // Find the closest match in the food types
      const matchedType = findClosestFoodType(foodName);
      
      if (!matchedType) {
        return { storage_time: 7, method: 1 }; // Default to 7 days in refrigerator
      }
      
      const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
        food_type: matchedType
      });
      
      return { 
        storage_time: response.data.storage_time,
        method: response.data.method
      };
    } catch (error) {
      console.error(`Error getting storage time for ${foodName}:`, error);
      return { storage_time: 7, method: 1 }; // Default to 7 days in refrigerator
    } finally {
      setIsFetchingRecommendation(false);
    }
  };

  /**
   * Finds closest matching food type from available options
   * @param {string} inputName - Food name to match
   * @returns {string | null} Matched food type or null if no match found
   */
  const findClosestFoodType = (inputName: string): string | null => {
    if (foodTypeOptions.length === 0) return null;
    
    // Try exact match first (case insensitive)
    const exactMatch = foodTypeOptions.find(
      type => type.toLowerCase() === inputName.toLowerCase()
    );
    
    if (exactMatch) return exactMatch;
    
    // Try substring match
    const substringMatches = foodTypeOptions.filter(
      type => type.toLowerCase().includes(inputName.toLowerCase()) || 
              inputName.toLowerCase().includes(type.toLowerCase())
    );
    
    if (substringMatches.length > 0) {
      // Return the shortest matching string as it's likely more specific
      return substringMatches.sort((a, b) => a.length - b.length)[0];
    }
    
    // No match found
    return null;
  };

  /**
   * Finds an existing item with similar name and expiry date
   * @param {string} name - Item name to check
   * @param {string} expiryDate - Expiry date to compare
   * @returns {FoodItem | null} Matching item or null if no match found
   */
  const findMatchingItem = (name: string, expiryDate: string): FoodItem | null => {
    // Case insensitive name match
    const matchingItems = items.filter(item => 
      item.name.toLowerCase() === name.toLowerCase()
    );
    
    if (matchingItems.length === 0) return null;
    
    // Check for similar expiry dates (within 2 days)
    const newExpiryDate = new Date(expiryDate);
    
    for (const item of matchingItems) {
      const existingExpiryDate = new Date(item.expiryDate);
      const diffDays = Math.abs((newExpiryDate.getTime() - existingExpiryDate.getTime()) / (1000 * 3600 * 24));
      
      // If expiry dates are within 2 days, return this item
      if (diffDays <= 2) {
        return item;
      }
    }
    
    return null;
  };

  /**
   * Handles adding or updating an item in the inventory
   * Gets storage recommendations for new items
   */
  const handleAddItem = async () => {
    if (validateForm()) {
      try {
        const newItem = {
          ...formState,
          id: isEditing && itemToEdit ? itemToEdit.id : Date.now().toString(),
          // Use current tab as location when not specified
          location: formState.location || selectedTab as "refrigerator" | "pantry",
          // Use current date if no expiry date
          expiryDate: formState.expiryDate || new Date().toISOString(),
          daysLeft: 0, // Will be calculated by the server
        };

        if (isEditing && itemToEdit) {
          updateItem(itemToEdit.id, newItem);
          resetForm();
          return;
        }

        // For new items, get storage time using the simplified approach
        const { storage_time, method } = await getStorageTime(newItem.name);
        
        // Use the recommended storage location and expiry date
        const storageMethod = method === 1 ? "refrigerator" : "pantry";
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + storage_time);
        const expiryDateString = expiryDate.toISOString();
        
        // Check if item already exists with similar expiry date
        const existingItem = findMatchingItem(newItem.name, expiryDateString);
        
        if (existingItem) {
          // Accumulate quantity for existing item
          const currentQuantity = existingItem.quantity;
          const newQuantity = combineQuantities(currentQuantity, newItem.quantity);
          
          // Update the existing item with new quantity
          updateItem(existingItem.id, {
            ...existingItem,
            quantity: newQuantity
          });
          
          // Let the user know that quantities were combined
          setError(`Added to existing "${newItem.name}" with similar expiry date.`);
        } else {
          // Add as new item with recommended values
          const recommendedItem = {
            ...newItem,
            location: formState.location || storageMethod, // Use selected location or recommendation
            expiryDate: formState.expiryDate || expiryDateString // Use selected date or recommendation
          };
          addItem(recommendedItem);
        }
        
        // Switch to the appropriate tab if location wasn't manually specified
        if (!formState.location) {
          setSelectedTab(storageMethod);
        }
        
        resetForm();
      } catch {
        setError("Failed to add item to the inventory.");
      } finally {
        setIsFetchingRecommendation(false);
      }
    }
  };

  /**
   * Combines quantities when adding to existing items
   * @param {string} q1 - First quantity
   * @param {string} q2 - Second quantity
   * @returns {string} Combined quantity string
   */
  const combineQuantities = (q1: string, q2: string): string => {
    // Special case for items already with combined quantities
    if (q1.includes('+')) {
      const parts = q1.split('+').map(p => p.trim());
      parts.push(q2);
      return parts.join(' + ');
    }
    
    // Convert to numbers if both quantities are numeric
    const num1 = parseFloat(q1);
    const num2 = parseFloat(q2);
    
    if (!isNaN(num1) && !isNaN(num2)) {
      // If both quantities have the same unit (e.g., "g", "kg", "ml", etc.)
      const unit1 = q1.replace(/[\d.]/g, '').trim();
      const unit2 = q2.replace(/[\d.]/g, '').trim();
      
      if (unit1 === unit2) {
        return `${(num1 + num2).toString()}${unit1}`;
      }
    }
    
    // If quantities cannot be combined numerically, concatenate with '+'
    return `${q1} + ${q2}`;
  };

  /**
   * Resets the form to default values
   */
  const resetForm = () => {
    setFormState({
      name: "",
      quantity: "",
      expiryDate: "",
      location: null as unknown as "refrigerator" | "pantry",
    });
    setIsEditing(false);
    setItemToEdit(null);
    setError(null);
  };

  // Validate form fields before submission
  const validateForm = () => {
    if (!formState.name || !formState.quantity) {
      setError("Food item name and quantity are required.");
      return false;
    }
    setError(null);
    return true;
  };

  // Handle edit item operation
  const handleEditItem = (item: FoodItem) => {
    setIsEditing(true);
    setItemToEdit(item);
    setShowMoreOptions(true); // Show more options when editing
    setFormState({
      name: item.name,
      quantity: item.quantity,
      location: item.location,
      expiryDate: item.expiryDate.split('T')[0],
    });
  };

  // Handle delete item operation
  const handleDeleteItem = (id: string) => {
    removeItem(id);
    if (itemToEdit && itemToEdit.id === id) {
      resetForm();
    }
  };

  // Update the clearAllItems function to remove duplicate comments
  const clearAllItems = () => {
    // Use the store's clearAll function
    clearAll();
    resetForm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalContent>
        <ModalHeader>Manage Food Inventory</ModalHeader>
        <ModalBody>
          <div className="mb-6">
            {error && (
              <div className={`mb-4 p-3 text-sm rounded-md ${
                error.includes("No matching food type") 
                  ? "bg-yellow-50 text-yellow-700" 
                  : error.includes("Added to existing")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-500"
              }`}>
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2 relative">
                <Input
                  label="Food Item"
                  placeholder="e.g., Chicken Breast"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                />
              </div>
              <div>
                <Input
                  label="Quantity"
                  placeholder="e.g., 500g, 2L"
                  value={formState.quantity}
                  onChange={(e) => setFormState({ ...formState, quantity: e.target.value })}
                />
              </div>
            </div>

            {showMoreOptions && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Select
                    label="Location"
                    placeholder="Choose location"
                    selectedKeys={formState.location ? [formState.location] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      if (selectedKey) {
                        setFormState({
                          ...formState,
                          location: selectedKey as "refrigerator" | "pantry"
                        });
                      }
                    }}
                  >
                    <SelectItem key="refrigerator">Refrigerator</SelectItem>
                    <SelectItem key="pantry">Pantry</SelectItem>
                  </Select>
                </div>
                <div>
                  <Input
                    type="date"
                    label="Expiry Date"
                    placeholder="Choose expiry date"
                    value={formState.expiryDate}
                    onChange={(e) => setFormState({ ...formState, expiryDate: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 mb-6">
              <Button
                color="primary"
                className="flex-1 bg-[#2F5233] text-white hover:bg-[#1B371F]"
                onPress={handleAddItem}
                isLoading={isFetchingRecommendation}
              >
                {isEditing ? "Update Item" : "Add Item"}
              </Button>
              
              <Button
                variant="flat"
                onPress={() => setShowMoreOptions(!showMoreOptions)}
                className="flex-none"
              >
                {showMoreOptions ? "Hide Options" : "More Options"}
              </Button>
            </div>
          </div>

          {/* Replace tabs with side-by-side layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Refrigerator Section */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Refrigerator</h3>
              </div>
              
              <div className="mt-4">
                {getItemsByLocation("refrigerator").length === 0 ? (
                  <p className="text-gray-500">No items in refrigerator</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {getItemsByLocation("refrigerator").map((item) => (
                      <li key={item.id} className="py-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()} <span className="text-sm text-gray-500">qty: {item.quantity}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Expires in {item.daysLeft} days
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            isIconOnly
                            variant="light"
                            onPress={() => handleEditItem(item)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            isIconOnly
                            variant="light"
                            color="danger"
                            onPress={() => handleDeleteItem(item.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Pantry Section */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Pantry</h3>
              </div>

              <div className="mt-4">
                {getItemsByLocation("pantry").length === 0 ? (
                  <p className="text-gray-500">No items in pantry</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {getItemsByLocation("pantry").map((item) => (
                      <li key={item.id} className="py-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()} <span className="text-sm text-gray-500">qty: {item.quantity}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Expires in {item.daysLeft} days
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            isIconOnly
                            variant="light"
                            onPress={() => handleEditItem(item)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            isIconOnly
                            variant="light"
                            color="danger"
                            onPress={() => handleDeleteItem(item.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-between w-full">
            <Button 
              color="danger" 
              variant="flat"
              onPress={clearAllItems}
            >
              Clear All Items
            </Button>
            <Button 
              color="danger" 
              variant="light" 
              onPress={onClose}
            >
              Close
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 