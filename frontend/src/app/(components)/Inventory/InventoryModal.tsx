import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Tabs, Tab, Spinner } from "@heroui/react";
import { FoodItem } from "@/store/useInventoryStore";
import useInventoryStore from "@/store/useInventoryStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { config } from "@/config";

type InventoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Type for storage recommendation from the API
type StorageRecommendation = {
  type: string;
  storage_time: number;
  method: number; // 1 for refrigerator, 0 for pantry
};

// Type for food types API response
type FoodTypesResponse = {
  food_types: string[];
};

export default function InventoryModal({ isOpen, onClose }: InventoryModalProps) {
  const { items, addItem, updateItem, removeItem, getItemsByLocation, clearAll } = useInventoryStore();
  const [selectedTab, setSelectedTab] = useState<string>("refrigerator");
  const [isEditing, setIsEditing] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<FoodItem | null>(null);
  const [isFetchingRecommendation, setIsFetchingRecommendation] = useState(false);
  const [foodTypeOptions, setFoodTypeOptions] = useState<string[]>([]);
  const [fetchingFoodTypes, setFetchingFoodTypes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formState, setFormState] = useState<Omit<FoodItem, "id" | "daysLeft">>({
    name: "",
    quantity: "",
    location: "refrigerator",
    expiryDate: new Date().toISOString().split("T")[0],
  });

  // Fetch food types when component mounts
  useEffect(() => {
    if (isOpen) {
      fetchFoodTypes();
    }
  }, [isOpen]);

  // Fetch all available food types from the API
  const fetchFoodTypes = async () => {
    try {
      setFetchingFoodTypes(true);
      const response = await axios.get<FoodTypesResponse>(`${config.apiUrl}/api/food-types/`);
      if (response.data && response.data.food_types) {
        setFoodTypeOptions(response.data.food_types);
      }
    } catch (error) {
      setError("Failed to load food types from the database.");
    } finally {
      setFetchingFoodTypes(false);
    }
  };

  // Fetch storage recommendation from the API
  const fetchStorageRecommendation = async (foodName: string): Promise<StorageRecommendation | null> => {
    try {
      setIsFetchingRecommendation(true);
      setError(null);
      
      // Find the closest match in the food types
      const matchedType = findClosestFoodType(foodName);
      
      if (!matchedType) {
        return null;
      }
      
      const response = await axios.post<StorageRecommendation>(`${config.apiUrl}/api/storage-advice/`, {
        food_type: matchedType
      });
      
      return response.data;
    } catch (err) {
      const error = err as any;
      if (error.response) {
        setError(`API error: ${error.response.status} - Failed to get storage recommendation`);
      } else {
        setError("Failed to get storage recommendation from the database.");
      }
      return null;
    } finally {
      setIsFetchingRecommendation(false);
    }
  };

  // Find closest matching food type from the available options
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

  // Find matching item with similar expiry date
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

  const handleAddItem = async () => {
    if (!formState.name || !formState.quantity) {
      setError("Food item name and quantity are required.");
      return;
    }

    setError(null);

    if (isEditing && itemToEdit) {
      updateItem(itemToEdit.id, formState);
      resetForm();
      return;
    }

    // For new items, fetch storage recommendation
    setIsFetchingRecommendation(true);
    const recommendation = await fetchStorageRecommendation(formState.name);
    
    if (recommendation) {
      // Use the recommended storage location and expiry date
      const storageMethod = recommendation.method === 1 ? "refrigerator" : "pantry";
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + recommendation.storage_time);
      const expiryDateString = expiryDate.toISOString();
      
      // Check if item already exists with similar expiry date
      const existingItem = findMatchingItem(formState.name, expiryDateString);
      
      if (existingItem) {
        // Accumulate quantity for existing item
        const currentQuantity = existingItem.quantity;
        const newQuantity = combineQuantities(currentQuantity, formState.quantity);
        
        // Update the existing item with new quantity
        updateItem(existingItem.id, {
          ...existingItem,
          quantity: newQuantity
        });
        
        // Let the user know that quantities were combined
        setError(`Added to existing "${formState.name}" with similar expiry date.`);
      } else {
        // Add as new item with recommended values
        addItem({
          name: formState.name,
          quantity: formState.quantity,
          location: storageMethod,
          expiryDate: expiryDateString,
        });
      }
      
      // Switch to the appropriate tab
      setSelectedTab(storageMethod);
    } else {
      // Show warning if no matching food type is found
      setError(`No matching food type found for "${formState.name}". Using default values.`);
      
      const expiryDateString = new Date(formState.expiryDate).toISOString();
      
      // Check if item already exists with similar expiry date
      const existingItem = findMatchingItem(formState.name, expiryDateString);
      
      if (existingItem) {
        // Accumulate quantity for existing item
        const currentQuantity = existingItem.quantity;
        const newQuantity = combineQuantities(currentQuantity, formState.quantity);
        
        // Update the existing item with new quantity
        updateItem(existingItem.id, {
          ...existingItem,
          quantity: newQuantity
        });
        
        // Let the user know that quantities were combined
        setError(`Added to existing "${formState.name}" with similar expiry date.`);
      } else {
        // Add as new item with default values
        addItem({
          ...formState,
          expiryDate: expiryDateString,
        });
      }
    }
    
    resetForm();
  };

  // Helper function to combine quantity strings
  const combineQuantities = (q1: string, q2: string): string => {
    // Try to extract numeric parts
    const num1 = parseFloat(q1.replace(/[^0-9.]/g, '')) || 0;
    const num2 = parseFloat(q2.replace(/[^0-9.]/g, '')) || 0;
    
    // Try to extract units
    const unit1 = q1.replace(/[0-9.]/g, '').trim();
    const unit2 = q2.replace(/[0-9.]/g, '').trim();
    
    // If both are just numbers (no units), return the sum as a number
    if (!unit1 && !unit2) {
      return `${num1 + num2}`;
    }
    
    // If both have the same unit, combine them
    if (unit1 && unit1 === unit2) {
      return `${num1 + num2}${unit1}`;
    }
    
    // If one is just a number and the other has a unit
    if (!unit1 && unit2) {
      return `${num1 + num2}${unit2}`;
    }
    
    if (unit1 && !unit2) {
      return `${num1 + num2}${unit1}`;
    }
    
    // Otherwise, just concatenate with a +
    return `${q1} + ${q2}`;
  };

  const resetForm = () => {
    // Reset form
    setFormState({
      name: "",
      quantity: "",
      location: selectedTab as "refrigerator" | "pantry",
      expiryDate: new Date().toISOString().split("T")[0],
    });
    setIsEditing(false);
    setItemToEdit(null);
    
    // Only reset errors that aren't warnings about food type matches
    if (error && !error.includes("No matching food type found") && !error.includes("Added to existing")) {
      setError(null);
    }
    
    // Set a timeout to clear the warning after 5 seconds
    if (error && (error.includes("No matching food type found") || error.includes("Added to existing"))) {
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const handleEditItem = (item: FoodItem) => {
    setIsEditing(true);
    setItemToEdit(item);
    setFormState({
      name: item.name,
      quantity: item.quantity,
      location: item.location,
      expiryDate: new Date(item.expiryDate).toISOString().split("T")[0],
    });
    setError(null);
  };

  const handleDeleteItem = (id: string) => {
    removeItem(id);
    if (isEditing && itemToEdit?.id === id) {
      resetForm();
    }
  };

  // Safe method to handle tab changes with any type of key
  const handleTabChange = (key: any) => {
    // Convert to string and ensure it's a valid location
    const tabKey = String(key);
    if (["refrigerator", "pantry"].includes(tabKey)) {
      setSelectedTab(tabKey);
      setFormState(prev => ({
        ...prev,
        location: tabKey as "refrigerator" | "pantry",
      }));
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Select
                  label="Location"
                  selectedKeys={[formState.location]}
                  onChange={(e) => setFormState({ ...formState, location: e.target.value as "refrigerator" | "pantry" })}
                >
                  <SelectItem key="refrigerator">Refrigerator</SelectItem>
                  <SelectItem key="pantry">Pantry</SelectItem>
                </Select>
                {!isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Will be auto-set based on food type when adding
                  </p>
                )}
              </div>
              <div>
                <Input
                  type="date"
                  label="Expiry Date"
                  value={formState.expiryDate}
                  onChange={(e) => setFormState({ ...formState, expiryDate: e.target.value })}
                />
                {!isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Will be auto-calculated based on food type when adding
                  </p>
                )}
              </div>
            </div>

            <Button
              color="primary"
              className="w-full bg-[#2F5233] text-white hover:bg-[#1B371F]"
              onPress={handleAddItem}
              isLoading={isFetchingRecommendation}
            >
              {isEditing ? "Update Item" : "Add Item"}
            </Button>
          </div>

          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={handleTabChange}
            color="primary"
          >
            <Tab key="refrigerator" title="Refrigerator">
              <div className="mt-4">
                {getItemsByLocation("refrigerator").length === 0 ? (
                  <p className="text-gray-500">No items in refrigerator</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {getItemsByLocation("refrigerator").map((item) => (
                      <li key={item.id} className="py-3 flex justify-between items-center">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <div className="text-sm text-gray-500">
                            {item.quantity.includes('+') 
                              ? item.quantity 
                              : `${item.quantity}`} · Expires in {item.daysLeft} days
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
            </Tab>
            <Tab key="pantry" title="Pantry">
              <div className="mt-4">
                {getItemsByLocation("pantry").length === 0 ? (
                  <p className="text-gray-500">No items in pantry</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {getItemsByLocation("pantry").map((item) => (
                      <li key={item.id} className="py-3 flex justify-between items-center">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <div className="text-sm text-gray-500">
                            {item.quantity.includes('+') 
                              ? item.quantity 
                              : `${item.quantity}`} · Expires in {item.daysLeft} days
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
            </Tab>
          </Tabs>
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