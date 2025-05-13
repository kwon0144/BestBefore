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
 * Type definition for storage advice API response
 */
type StorageAdviceResponse = {
  days: number;
  method: string; // 'fridge' or 'pantry'
  source?: string;
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
   * Gets recommended storage time and method for a food item
   * @param {string} foodName - Food name to get storage advice for
   * @returns {Promise<{storage_time: number; method: string}>} Storage time and method recommendation
   */
  const getStorageTime = async (foodName: string): Promise<{storage_time: number; method: string}> => {
    try {
      setIsFetchingRecommendation(true);
      
      const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage_assistant/`, {
        produce_name: foodName
      });

      if (!response.data) {
        return { storage_time: 7, method: 'fridge' }; // Default to 7 days in refrigerator
      }

      // Get the correct storage time based on the recommended method
      const storage_time = response.data.method === 'fridge' ? response.data.fridge : response.data.pantry;
      
      return { 
        
        storage_time: response.data.days,

        method: response.data.method
      };
    } catch (error) {
      console.error(`Error getting storage time for ${foodName}:`, error);
      return { storage_time: 7, method: 'fridge' }; // Default to 7 days in refrigerator
    } finally {
      setIsFetchingRecommendation(false);
    }
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
      const { storage_time, method } = await getStorageTime(formState.name);
      
      const newItem = {
        ...formState,
        id: isEditing && itemToEdit ? itemToEdit.id : Date.now().toString(),
        location: formState.location || (method === 1 ? "refrigerator" : "pantry"),
        expiryDate: new Date(Date.now() + storage_time * 24 * 60 * 60 * 1000).toISOString(),
        daysLeft: storage_time
      };

      if (isEditing && itemToEdit) {
        updateItem(itemToEdit.id, newItem);
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
        // For new items, get storage time using the simplified approach
        const { storage_time, method } = await getStorageTime(newItem.name);
        
        // Use the recommended storage location and expiry date
        const storageMethod = method === 'fridge' ? "refrigerator" : "pantry";
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
          
          // Show toast for combined quantities
          addToast({
            title: "Item Updated",
            description: `Added to existing "${newItem.name}" with similar expiry date.`,
            classNames: {
              base: "bg-background",
              title: "text-darkgreen font-medium font-semibold",
              description: "text-darkgreen",
              icon: "text-darkgreen"
            },
            timeout: 3000
          });
        } else {
          // Add as new item with recommended values
          const recommendedItem = {
            ...newItem,
            location: storageMethod as "refrigerator" | "pantry",
            expiryDate: expiryDateString
          };
          addItem(recommendedItem);
          addToast({
            title: "Item Added",
            description: `"${formState.name}" added to your inventory`,
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

  // Update the handleStorageTransfer function to handle undefined daysLeft
  const handleStorageTransfer = async (item: FoodItem, newLocation: "refrigerator" | "pantry") => {
    try {
      const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
        food_type: findClosestFoodType(item.name)
      });

      if (!response.data) {
        throw new Error("Failed to get storage advice");
      }

      // Get the new storage time based on the new location
      const newStorageTime = newLocation === "refrigerator" ? response.data.fridge : response.data.pantry;
      
      // Calculate remaining life percentage
      const currentDate = new Date();
      const expiryDate = new Date(item.expiryDate);
      const currentDaysLeft = item.daysLeft || 0;
      const totalDays = currentDaysLeft + Math.floor((currentDate.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24));
      const remainingPercentage = totalDays > 0 ? currentDaysLeft / totalDays : 1;
      
      // Calculate new days left based on the percentage of shelf life remaining
      const newDaysLeft = Math.ceil(newStorageTime * remainingPercentage);
      
      // Calculate new expiry date
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + newDaysLeft);

      // Update the item
      const updatedItem = {
        ...item,
        location: newLocation,
        expiryDate: newExpiryDate.toISOString(),
        daysLeft: newDaysLeft
      };

      // Update item in store
      updateItem(item.id, updatedItem);

      addToast({
        title: "Storage Updated",
        description: `${item.name} moved to ${newLocation}`,
        classNames: {
          base: "bg-background",
          title: "text-darkgreen font-medium font-semibold",
          description: "text-darkgreen",
          icon: "text-darkgreen"
        },
        timeout: 3000
      });

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