'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import { config } from '@/config';
import Camera from './Camera';
import StorageRecommendations from './StorageRecommendation';
import CalendarExport from './CalendarExport';
import { 
  CameraState, 
  ProduceDetections, 
  StorageRecommendation, 
  CalendarSelection,
  FoodTypesResponse,
  StorageAdviceResponse,
  CalendarResponse
} from './interfaces';
import Title from "../(components)/Title";
import StorageAssistantStepper from "./StorageAssistantStepper";
import { Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBell } from "@fortawesome/free-solid-svg-icons";
import useInventoryStore from "@/store/useInventoryStore";

const FoodStorageAssistant: React.FC = () => {
  // State for step navigation
  const [currentStep, setCurrentStep] = useState(0);
  
  // Calendar selection state
  const [calendarSelection, setCalendarSelection] = useState<CalendarSelection>({
    selectedItems: [],
    calendarLink: null,
    reminderDays: 2, // Default 2 days before reminder
    reminderTime: "20:00", // Default 8pm reminder
  });
  
  // Main component state
  const [state, setState] = useState<CameraState>({
    stream: null,
    photos: [], // Now stores multiple photos
    error: null,
    isAnalyzing: false,
    detections: null,
    submittedPhotos: []
  });

  // State for storage recommendations
  const [storageRecs, setStorageRecs] = useState<StorageRecommendation>({
    fridge: [],
    pantry: [],
  });

  // Get the addIdentifiedItem function from the inventory store
  const addIdentifiedItem = useInventoryStore((state) => state.addIdentifiedItem);
  
  // State to track if items were added to inventory
  const [itemsAddedToInventory, setItemsAddedToInventory] = useState(false);
  
  // Submit photos for analysis
  const submitPhotos = async () => {
    if (state.photos.length === 0) return;

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      // Call API endpoint for produce detection with all photos
      const response = await axios.post(`${config.apiUrl}/api/detect-produce/`, {
        images: state.photos // Send array of photos
      });

      // Stop the camera stream
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }

      setState(prev => ({
        ...prev,
        stream: null,
        detections: response.data as ProduceDetections,
        isAnalyzing: false,
        submittedPhotos: [...prev.photos] // Store submitted photos
      }));

      // Move to step 1: Storage Recommendations after submission
      setCurrentStep(1);

      // After submission, fetch storage recommendations
      fetchStorageRecommendations((response.data as ProduceDetections).produce_counts);
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: `Analysis failed: ${err instanceof Error ? err.message : String(err)}`,
        isAnalyzing: false
      }));
    }
  };

  // Fetch storage recommendations for detected items
  const fetchStorageRecommendations = async (produceCounts: { [key: string]: number } = {}) => {
    try {
      // Reset the items added flag
      setItemsAddedToInventory(false);
      
      // Get all food types
      const foodTypesResponse = await axios.get<FoodTypesResponse>(`${config.apiUrl}/api/food-types/`);
      const allFoodTypes = foodTypesResponse.data.food_types;
      
      // If no food detected, use empty array
      const allItems = Object.keys(produceCounts).length > 0
        ? Object.keys(produceCounts)
        : [];
      
      // Get storage advice for each item
      const fridgeItems: Array<{ name: string; quantity: number }> = [];
      const pantryItems: Array<{ name: string; quantity: number }> = [];
      
      // Only add to inventory if there are items detected
      if (allItems.length > 0) {
        setItemsAddedToInventory(true);
      }
      
      for (const item of allItems) {
        try {
          // Find best matching food type
          const matchedType = allFoodTypes.find((type: string) => 
            type.toLowerCase().includes(item.toLowerCase()) || 
            item.toLowerCase().includes(type.toLowerCase())
          );
          
          if (matchedType) {
            const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
              food_type: matchedType
            });

            const recommendation = response.data;
            const quantity = produceCounts[item] || 1;
            const storageTime = recommendation.storage_time;
            
            // Add the item to inventory store
            addIdentifiedItem(
              item,                                     // Item name 
              `${quantity} item${quantity > 1 ? 's' : ''}`,  // Quantity
              storageTime                               // Expiry days
            );

            if (recommendation.method === 1) {
              fridgeItems.push({
                name: `${item} (${recommendation.storage_time} days)`,
                quantity: quantity
              });
            } else if (recommendation.method === 0) {
              pantryItems.push({
                name: `${item} (${recommendation.storage_time} days)`,
                quantity: quantity
              });
            }
          } else {
            const quantity = produceCounts[item] || 1;
            const isRefrigeratedItem = ['lettuce', 'berries', 'mushrooms', 'herbs'].includes(item.toLowerCase());
            const defaultStorageTime = isRefrigeratedItem ? 7 : 14; // Default storage times
            
            // Add to inventory with default values
            addIdentifiedItem(
              item,
              `${quantity} item${quantity > 1 ? 's' : ''}`,
              defaultStorageTime
            );
            
            if (isRefrigeratedItem) {
              fridgeItems.push({ name: item, quantity: quantity });
            } else {
              pantryItems.push({ name: item, quantity: quantity });
            }
          }
        } catch (err) {
          console.error(`Error fetching storage advice for ${item}:`, err);

          // Use default categorization
          const quantity = produceCounts[item] || 1;
          const isRefrigeratedItem = ['lettuce', 'berries', 'mushrooms', 'herbs'].includes(item.toLowerCase());
          const defaultStorageTime = isRefrigeratedItem ? 7 : 14;
          
          // Add to inventory even if there's an error
          addIdentifiedItem(
            item,
            `${quantity} item${quantity > 1 ? 's' : ''}`,
            defaultStorageTime
          );
          
          if (isRefrigeratedItem) {
            fridgeItems.push({ name: item, quantity: quantity });
          } else {
            pantryItems.push({ name: item, quantity: quantity });
          }
        }
      }
      
      setStorageRecs({
        fridge: fridgeItems,
        pantry: pantryItems,
      });
    } catch (err) {
      console.error('Error fetching food types:', err);

      // Use empty arrays instead of default data
      const allItems = Object.keys(produceCounts).length > 0
        ? Object.keys(produceCounts)
        : [];
      
      const fridgeItems = allItems
        .filter(item => ['lettuce', 'berries', 'mushrooms', 'herbs'].includes(item.toLowerCase()))
        .map(item => ({ name: item, quantity: produceCounts[item] || 1 }));
      
      const pantryItems = allItems
        .filter(item => !['lettuce', 'berries', 'mushrooms', 'herbs'].includes(item.toLowerCase()))
        .map(item => ({ name: item, quantity: produceCounts[item] || 1 }));
      
      setStorageRecs({
        fridge: fridgeItems,
        pantry: pantryItems,
      });
    }
  };

  // Handle storage recommendations update
  const handleStorageRecsUpdate = (newStorageRecs: StorageRecommendation) => {
    setStorageRecs(newStorageRecs);
  };

  // Calculate expiry date based on storage time
  // const calculateExpiryDate = (storageTime: number): number => {
  //   return storageTime;
  // };

  // Toggle item selection for calendar
  // const toggleItemSelection = (item: string, quantity: number, storageTime: number) => {
  //   setCalendarSelection(prev => {
  //     const existingIndex = prev.selectedItems.findIndex(i => i.name === item);
      
  //     if (existingIndex >= 0) {
  //       const newSelectedItems = [...prev.selectedItems];
  //       newSelectedItems.splice(existingIndex, 1);
  //       return { ...prev, selectedItems: newSelectedItems };
  //     } else {
  //       const newItem = {
  //         name: item,
  //         quantity,
  //         expiry_date: calculateExpiryDate(storageTime),
  //         reminder_days: prev.reminderDays,
  //         reminder_time: prev.reminderTime
  //       };
  //       return { ...prev, selectedItems: [...prev.selectedItems, newItem] };
  //     }
  //   });
  // };

  // Generate calendar link
  const generateCalendarLink = async () => {
    if (calendarSelection.selectedItems.length === 0) return;
  
    try {
      const response = await axios.post<CalendarResponse>(`${config.apiUrl}/api/generate_calendar/`, {
        items: calendarSelection.selectedItems.map(item => ({
          ...item,
          expiry_date: item.expiry_date,
          reminder_days: calendarSelection.reminderDays,
          reminder_time: calendarSelection.reminderTime
        })),
        reminder_days: calendarSelection.reminderDays,
        reminder_time: calendarSelection.reminderTime
      });
  
      setCalendarSelection(prev => ({
        ...prev,
        calendarLink: response.data.calendar_url
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: `Calendar generation failed: ${err instanceof Error ? err.message : String(err)}`
      }));
    }
  };

  // Step navigation - allow users to jump to any step
  const handleStepClick = (step: number) => {
    setCurrentStep(step);
    setState(prev => ({
      ...prev,
      stream: null,
      error: null
    }));
  };

  // Reset functionality
  const handleReset = () => {
    setState(prev => ({
      ...prev,
      photos: [],
      detections: null,
      submittedPhotos: [],
      error: null
    }));
  };

  // Initialize with storage recommendations on mount
  useEffect(() => {
    fetchStorageRecommendations();
    // Clean up camera stream on unmount
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen max-w-7xl mx-auto py-20 px-10">
        {/* Title section */}
        <Title heading="Food Storage Assistant" description="Capture your groceries and get storage recommendations" />
        {/* Stepper for navigation */}
        <div className="py-12">
          <StorageAssistantStepper currentStep={currentStep} onStepClick={handleStepClick}/>
        </div>
        {/* Error message display */}
        {state.error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md mb-5 border-l-4 border-red-500">
            {state.error.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}
        {/* Step 1: Camera and Photo Capture */}
        {currentStep === 0 ? (
          <div className="border-green border-2 rounded-lg p-10 mb-8">
            <h2 className="text-2xl font-semibold text-darkgreen mb-10">
              Step 1: Scan your Groceries
            </h2>
            <Camera state={state} setState={setState} submitPhotos={submitPhotos} handleReset={handleReset} />
          </div>
        ) : (
          <>
          {currentStep === 1 ? (
            <>
            {/* Step 2: Storage Recommendations */}
            <div className="border-green border-2 rounded-lg p-10 mb-8">
                <Button
                  onPress={() => setCurrentStep(0)}
                  className="text-amber-600 flex items-center cursor-pointer whitespace-nowrap bg-transparent p-0"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="text-amber-600 mr-2" />
                  Back to Camera
                </Button>
                <h2 className="text-2xl font-semibold text-darkgreen mb-5">
                  Step 2: Storage Recommendations
                </h2>
                
                {/* Add the notification for items added to inventory */}
                {itemsAddedToInventory && (
                  <div className="bg-green-100 text-green-800 p-4 rounded-md mb-5 border-l-4 border-green-500">
                    <p className="font-medium">Items have been added to your food inventory!</p>
                    <p>All detected items have been automatically added to your inventory and will be available in the Eco Grocery page.</p>
                  </div>
                )}
                
                <StorageRecommendations 
                  storageRecs={storageRecs} 
                  onUpdateStorageRecs={handleStorageRecsUpdate} 
                />
                <div className="flex justify-end mt-8">
                  <Button
                    onPress={() => setCurrentStep(2)}
                    className="bg-darkgreen text-white py-2 px-8 rounded-lg"
                  >
                    <FontAwesomeIcon icon={faBell} className="text-white"/> 
                    <p className="font-semibold text-white">Set Up Expiry Reminders</p>
                  </Button>
                </div>
              </div>
            </>
            ) : (
              <>
            {/* Calendar Export Section */}
            <div className="border-green border-2 rounded-lg p-10 mb-8">
            <Button
                  onPress={() => setCurrentStep(1)}
                  className="text-amber-600 flex items-center cursor-pointer whitespace-nowrap bg-transparent p-0"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="text-amber-600 mr-2" />
                  Back to Storage Recommendations
                </Button>
                <h2 className="text-2xl font-semibold text-darkgreen mb-5">
                  Step 3: Calendar Export
                </h2>
              <CalendarExport
                calendarSelection={calendarSelection}
                setCalendarSelection={setCalendarSelection}
                detections={state.detections}
                generateCalendarLink={generateCalendarLink}
                storageRecs={storageRecs}
              />
            </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default FoodStorageAssistant;