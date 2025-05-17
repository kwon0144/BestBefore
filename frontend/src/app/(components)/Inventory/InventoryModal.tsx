/**
 * This component provides a modal interface for managing food inventory.
 * It allows users to add, edit, and remove food items from their refrigerator and pantry,
 * with intelligent recommendations for storage locations and expiry dates based on food types.
 */
import { useState, useEffect } from "react";
import type { DragEvent } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, ToastProvider, addToast } from "@heroui/react";
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
  Type: string;
  pantry: number;
  fridge: number;
  method: number;
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
  const [isEditing, setIsEditing] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<FoodItem | null>(null);
  const [isFetchingRecommendation, setIsFetchingRecommendation] = useState(false);
  const [foodTypeOptions, setFoodTypeOptions] = useState<string[]>([]);
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
      addToast({
        title: "Error",
        description: "Failed to load food types from the database.",
        classNames: {
          base: "bg-red-50",
          title: "text-amber-700 font-medium font-semibold",
          description: "text-amber-700",
          icon: "text-amber-700"
        },
        timeout: 3000
      });
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
        console.log(`No food type match found for ${foodName}, using default values`);
        return { storage_time: 7, method: 1 }; // Default to 7 days in refrigerator
      }
      
      const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
        food_type: matchedType
      });

      if (!response.data) {
        console.log(`No response data for ${foodName}, using default values`);
        return { storage_time: 7, method: 1 }; // Default to 7 days in refrigerator
      }

      // Get values from API response
      const method = response.data.method;
      const fridgeTime = response.data.fridge || 7; // Default to 7 if undefined
      const pantryTime = response.data.pantry || 14; // Default to 14 if undefined
      
      // Determine the appropriate storage time based on user's selection or API recommendation
      let storage_time;
      let recommended_location;
      
      // If user has explicitly selected a location, use that location's storage time
      if (formState.location) {
        storage_time = formState.location === "refrigerator" ? fridgeTime : pantryTime;
        recommended_location = formState.location;
      } else {
        // Otherwise use the API's recommended method
        recommended_location = method === 1 ? "refrigerator" : "pantry";
        storage_time = method === 1 ? fridgeTime : pantryTime;
      }
      
      console.log(`Storage advice for ${foodName}:`, { 
        fridgeTime, 
        pantryTime, 
        recommendedMethod: method, 
        userLocation: formState.location,
        finalLocation: recommended_location,
        finalStorageTime: storage_time 
      });
      
      return { 
        storage_time: storage_time,
        method: method
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
   * Handles adding or updating an item in the inventory
   * Gets storage recommendations for new items
   */
  const handleAddItem = async () => {
    if (!validateForm()) {
      addToast({
        title: "Input Error",
        description: "Food item name and quantity are required.",
        classNames: {
          base: "bg-red-50",
          title: "text-amber-700 font-medium font-semibold",
          description: "text-amber-700",
          icon: "text-amber-700"
        },
        timeout: 3000
      });
      return;
    }

    try {
      // Get storage recommendation from API
      const { storage_time, method } = await getStorageTime(formState.name);
      
      // Determine the storage location - use user-selected location if available, 
      // otherwise use the recommended method from the API
      const location = formState.location || (method === 1 ? "refrigerator" : "pantry");
      
      // Get actual storage time for the selected location
      // This is important - we need to get the specific storage time for the selected location,
      // NOT just the recommended storage time
      let actualStorageTime = storage_time;
      
      // If the selected location doesn't match the recommended location (method),
      // we need to get the correct storage time for the selected location
      const isRecommendedFridge = method === 1;
      const isSelectedFridge = location === "refrigerator";
      
      if (isRecommendedFridge !== isSelectedFridge) {
        // We need to get the correct storage time for the selected location
        try {
          const foodType = findClosestFoodType(formState.name);
          const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
            food_type: foodType
          });
          
          if (response.data) {
            // Use the correct storage time for the selected location
            actualStorageTime = isSelectedFridge ? 
              (response.data.fridge || 7) : 
              (response.data.pantry || 14);
              
            console.log(`User selected ${location} which differs from recommendation. Using ${actualStorageTime} days instead of ${storage_time} days.`);
          }
        } catch (error) {
          console.error("Error getting correct storage time for selected location:", error);
          // Fall back to default storage times if needed
          actualStorageTime = isSelectedFridge ? 7 : 14;
        }
      }
      
      // Determine expiry date - use user-selected date if available,
      // otherwise calculate based on storage time
      const expiryDate = formState.expiryDate 
        ? new Date(formState.expiryDate).toISOString() 
        : new Date(Date.now() + actualStorageTime * 24 * 60 * 60 * 1000).toISOString();
      
      // Check if we're in edit mode
      if (isEditing && itemToEdit) {
        // Update existing item
        const updatedItem = {
          ...formState,
          id: itemToEdit.id,
          location: location,
          expiryDate: expiryDate,
          daysLeft: actualStorageTime
        };
        
        updateItem(itemToEdit.id, updatedItem);
        addToast({
          title: "Item Updated",
          description: `"${formState.name}" updated`,
          classNames: {
            base: "bg-background",
            title: "text-darkgreen font-medium font-semibold",
            description: "text-darkgreen",
            icon: "text-darkgreen"
          },
          timeout: 3000
        });
      } else {
        // Check if an item with the same name and location already exists
        const existingItem = items.find(item => 
          item.name.toLowerCase() === formState.name.toLowerCase() && 
          item.location === location
        );
        
        if (existingItem) {
          // Item exists, update its quantity instead of creating a new one
          // Extract numeric part from quantity strings like "2 items" or "500g"
          const existingQtyMatch = existingItem.quantity.match(/^(\d+)/);
          const newQtyMatch = formState.quantity.match(/^(\d+)/);
          
          let existingQty = existingQtyMatch ? parseInt(existingQtyMatch[1]) : 1;
          let newQty = newQtyMatch ? parseInt(newQtyMatch[1]) : 1;
          
          // Add quantities
          const totalQty = existingQty + newQty;
          
          // Determine unit from existing item (items, g, kg, etc.)
          const unitMatch = existingItem.quantity.match(/[^\d\s]+/);
          const unit = unitMatch ? unitMatch[0] : "items";
          
          // Create updated quantity string
          const updatedQuantity = `${totalQty} ${unit}`;
          
          // Update the existing item
          updateItem(existingItem.id, {
            ...existingItem,
            quantity: updatedQuantity
          });
          
          addToast({
            title: "Item Quantity Updated",
            description: `Added more "${formState.name}" to your inventory. New quantity: ${updatedQuantity}`,
            classNames: {
              base: "bg-background",
              title: "text-darkgreen font-medium font-semibold",
              description: "text-darkgreen",
              icon: "text-darkgreen"
            },
            timeout: 3000
          });
        } else {
          // Create new item
          const newItem = {
            ...formState,
            id: Date.now().toString(),
            location: location,
            expiryDate: expiryDate,
            daysLeft: actualStorageTime
          };
          
          addItem(newItem);
          addToast({
            title: "Item Added",
            description: `"${formState.name}" added to your inventory with ${actualStorageTime} days until expiry`,
            classNames: {
              base: "bg-background",
              title: "text-darkgreen font-medium font-semibold",
              description: "text-darkgreen",
              icon: "text-darkgreen"
            },
            timeout: 3000
          });
        }
      }
      
      resetForm();
      setIsEditing(false);
      setItemToEdit(null);
    } catch (error) {
      console.error("Error adding/updating item:", error);
      addToast({
        title: "Error",
        description: "Failed to add/update item. Please try again.",
        classNames: {
          base: "bg-red-50",
          title: "text-amber-700 font-medium font-semibold",
          description: "text-amber-700",
          icon: "text-amber-700"
        },
        timeout: 3000
      });
    }
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
  };

  // Validate form fields before submission
  const validateForm = () => {
    if (formState.name == "" || formState.quantity == "") {
      return false;
    }
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

  // Update the handleStorageTransfer function to handle different storage time recommendations
  const handleStorageTransfer = async (item: FoodItem, newLocation: "refrigerator" | "pantry") => {
    try {
      // Extract the pure item name without any storage information in parentheses
      // Item names from Claude might not be in the database
      const itemNameClean = item.name.split(' (')[0].trim();
      
      // Get the food type recommendation from the API
      const foodType = findClosestFoodType(itemNameClean);
      
      // If no food type match was found and the API call would fail with 400
      if (!foodType) {
        console.warn(`No matching food type found for ${itemNameClean}. Using item name directly.`);
        
        // Try with the clean item name directly
        const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
          food_type: itemNameClean
        });

        if (!response.data) {
          throw new Error("Failed to get storage advice");
        }

        // Get the appropriate storage time for the new location from the API
        // Make sure to handle undefined values and set defaults
        const fridgeTime = response.data.fridge || 7; // Default to 7 days
        const pantryTime = response.data.pantry || 14; // Default to 14 days
        
        // Use the correct storage time based on the new location
        const newStorageTime = newLocation === "refrigerator" ? fridgeTime : pantryTime;
        
        // Calculate new expiry date based on the full recommended storage time for the new location
        const newExpiryDate = new Date();
        newExpiryDate.setDate(newExpiryDate.getDate() + newStorageTime);

        // Update the item with the new values
        const updatedItem = {
          ...item,
          location: newLocation,
          expiryDate: newExpiryDate.toISOString(),
          daysLeft: newStorageTime
        };

        // Update item in store
        updateItem(item.id, updatedItem);

        addToast({
          title: "Storage Updated",
          description: `${item.name} moved to ${newLocation}. New expiry time: ${newStorageTime} days`,
          classNames: {
            base: "bg-background",
            title: "text-darkgreen font-medium font-semibold",
            description: "text-darkgreen",
            icon: "text-darkgreen"
          },
          timeout: 3000
        });
      } else {
        // Food type match was found, use it to call the API
        const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
          food_type: foodType
        });

        if (!response.data) {
          throw new Error("Failed to get storage advice");
        }

        // Get the appropriate storage time for the new location from the API
        // Make sure to handle undefined values and set defaults
        const fridgeTime = response.data.fridge || 7; // Default to 7 days
        const pantryTime = response.data.pantry || 14; // Default to 14 days
        
        // Use the correct storage time based on the new location
        const newStorageTime = newLocation === "refrigerator" ? fridgeTime : pantryTime;
        
        // Calculate new expiry date based on the full recommended storage time for the new location
        const newExpiryDate = new Date();
        newExpiryDate.setDate(newExpiryDate.getDate() + newStorageTime);

        // Update the item with the new values
        const updatedItem = {
          ...item,
          location: newLocation,
          expiryDate: newExpiryDate.toISOString(),
          daysLeft: newStorageTime
        };

        // Update item in store
        updateItem(item.id, updatedItem);

        addToast({
          title: "Storage Updated",
          description: `${item.name} moved to ${newLocation}. New expiry time: ${newStorageTime} days`,
          classNames: {
            base: "bg-background",
            title: "text-darkgreen font-medium font-semibold",
            description: "text-darkgreen",
            icon: "text-darkgreen"
          },
          timeout: 3000
        });
      }
    } catch (error) {
      console.error("Error transferring storage:", error);
      addToast({
        title: "Error",
        description: "Failed to update storage location. Please try again.",
        classNames: {
          base: "bg-red-50",
          title: "text-amber-700 font-medium font-semibold",
          description: "text-amber-700",
          icon: "text-amber-700"
        },
        timeout: 3000
      });
    }
  };

  // Update drag event type definitions
  const handleDragStart = (e: DragEvent<HTMLLIElement>, item: FoodItem) => {
    e.dataTransfer.setData("itemId", item.id);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-gray-100");
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("bg-gray-100");
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, targetLocation: "refrigerator" | "pantry") => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-gray-100");
    
    const itemId = e.dataTransfer.getData("itemId");
    const item = items.find(i => i.id === itemId);
    
    if (item && item.location !== targetLocation) {
      await handleStorageTransfer(item, targetLocation);
    }
  };

  return (
  <div>
    <ToastProvider placement={"top-center"} toastOffset={80}/>
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl font-semibold text-darkgreen">
            Manage Food Inventory
          </h2>
        </ModalHeader>
        <ModalBody>
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2 relative">
                <Input
                  label="Food Item"
                  placeholder="e.g., Chicken Breast"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  onClear={() => setFormState({ ...formState, name: "" })}
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

            <div className="flex gap-4">
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
            <div 
              className="border h-[200px] overflow-y-auto p-4 rounded-lg border-gray-200 transition-colors duration-200"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "refrigerator")}
            >
              <div className="mb-2 border-b-2 border-blue-500">
                <h3 className="text-lg font-medium font-semibold text-blue-600">Refrigerator</h3>
              </div>
              
              <div className="mt-2">
                {getItemsByLocation("refrigerator").length === 0 ? (
                  <div className="mt-4">
                    <p className="text-gray-500">No items in refrigerator</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {getItemsByLocation("refrigerator").map((item) => (
                      <li 
                        key={item.id} 
                        className="py-3 flex justify-between items-center cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                      >
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
            <div 
              className="border h-[200px] overflow-y-auto p-4 rounded-lg border-gray-200 transition-colors duration-200"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "pantry")}
            >
              <div className="mb-4 border-b-2 border-amber-700">
                <h3 className="text-lg font-medium font-semibold text-amber-700">Pantry</h3>
              </div>

              <div className="mt-2">
                {getItemsByLocation("pantry").length === 0 ? (
                  <div className="mt-4">
                    <p className="text-gray-500">No items in pantry</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {getItemsByLocation("pantry").map((item) => (
                      <li 
                        key={item.id} 
                        className="py-3 flex justify-between items-center cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                      >
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
  </div>
  );
}