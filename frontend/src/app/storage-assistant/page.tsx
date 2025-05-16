/**
 * FoodStorageAssistant Component
 * 
 * This component provides a comprehensive interface for managing food storage and expiration tracking.
 * Features include:
 * - Camera-based food item detection
 * - Storage recommendations for detected items
 * - Automatic inventory management
 * - Calendar-based expiration reminders
 * - Step-by-step guided workflow
 * - Responsive design with error handling
 */

'use client';

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { config } from '@/config';
import Camera from './Camera';
import StorageRecommendations from './StorageRecommendation';
import CalendarExport from './CalendarExport';
import CalendarImport from './CalendarImport';
import ComingUp from "../(components)/ComingUp";

import { 
  CameraState, 
  ProduceDetections, 
  StorageRecommendation, 
  CalendarSelection,
  StorageAdviceResponse,
  CalendarResponse
} from './interfaces';
import Title from "../(components)/Title";
import StorageAssistantStepper from "./StorageAssistantStepper";
import { addToast, Button, ToastProvider } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBell, faCalendarAlt, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import useInventoryStore from "@/store/useInventoryStore";
import InfoTooltip from "../(components)/InfoTooltip";

/**
 * Main component for the Food Storage Assistant feature
 * 
 * @returns {JSX.Element} Rendered Food Storage Assistant interface with step-by-step workflow
 */
const FoodStorageAssistant: React.FC = () => {
  // State for step navigation
  const [currentStep, setCurrentStep] = useState(0);
  
  /**
   * Scrolls to the main content section
   */
  const scrollToContentSection = () => {
    const contentSection = document.querySelector('.border-green');
    if (contentSection) {
      const elementPosition = contentSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  
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
  const addItem = useInventoryStore((state) => state.addItem);
  
  // State to track if items were added to inventory
  const [itemsAddedToInventory, setItemsAddedToInventory] = useState(false);
  
  /**
   * Submits captured photos for food item detection and analysis
   * 
   * @returns {Promise<void>} Promise that resolves when analysis is complete
   */
  const submitPhotos = async () => {
    if (state.photos.length === 0) return;

    console.log('API URL:', config.apiUrl);
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

  /**
   * Fetches storage recommendations for detected food items
   * 
   * @param {Object} produceCounts - Object containing detected food items and their counts
   * @returns {Promise<void>} Promise that resolves when recommendations are fetched
   */
  const fetchStorageRecommendations = useCallback(async (produceCounts: { [key: string]: number } = {}) => {
    try {
      // Reset the items added flag
      setItemsAddedToInventory(false);
      
      // If no food detected, check if we have inventory items to display
      const allItems = Object.keys(produceCounts).length > 0
        ? Object.keys(produceCounts)
        : [];
        
      // If no items detected but we have inventory items, sync with inventory instead
      if (allItems.length === 0) {
        const inventoryItems = useInventoryStore.getState().items;
        
        if (inventoryItems.length > 0) {
          // Don't reset storage recommendations if we're just syncing with inventory
          // The StorageRecommendation component will handle this
          return;
        }
      }
      
      // Get storage advice for each item
      const fridgeItems: Array<{ name: string; quantity: number }> = [];
      const pantryItems: Array<{ name: string; quantity: number }> = [];
      
      // Only add to inventory if there are newly detected items
      if (allItems.length > 0) {
        setItemsAddedToInventory(true);
      }
      
      for (const item of allItems) {
        try {
          // Call the storage-advice endpoint (handles database and Claude fallback)
          const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
            food_type: item
          });
          
          const recommendation = response.data;
          const quantity = produceCounts[item] || 1;
          
          // Properly handle different API response formats
          let fridgeStorageTime = 7; // Default fridge time
          let pantryStorageTime = 14; // Default pantry time
          let recommendedMethod = 'pantry'; // Default method
          
          // Extract storage times from the recommendation based on response format
          if (typeof recommendation.method === 'number') {
            // Database response format - method is a number (1=fridge, 2=pantry)
            recommendedMethod = recommendation.method === 1 ? 'fridge' : 'pantry';
            fridgeStorageTime = Number(recommendation.fridge) || fridgeStorageTime;
            pantryStorageTime = Number(recommendation.pantry) || pantryStorageTime;
          } else if (typeof recommendation.method === 'string') {
            // Claude response format - method is a string ('fridge' or 'pantry')
            recommendedMethod = recommendation.method;
            // Claude might only provide one storage time in the 'days' field
            const providedDays = Number(recommendation.days) || 7;
            if (recommendedMethod === 'fridge') {
              fridgeStorageTime = providedDays;
            } else {
              pantryStorageTime = providedDays;
            }
          }
          
          console.log(`Storage recommendation for ${item}:`, { 
            fridgeTime: fridgeStorageTime, 
            pantryTime: pantryStorageTime,
            recommendedMethod 
          });
          
          // Determine where to put the item based on recommendation
          // This is an initial recommendation but user can change later
          const isRecommendedForFridge = recommendedMethod === 'fridge';
          
          // Add the item to inventory store with the CORRECT storage time for the ACTUAL storage location
          // This is critical - we need to use the appropriate storage time for WHERE the item is being stored
          if (isRecommendedForFridge) {
            // Instead of using addIdentifiedItem with 4 parameters, directly use addItem
            // for more control over the location
            addItem({
              name: item,
              quantity: `${quantity} item${quantity > 1 ? 's' : ''}`,
              location: 'refrigerator',
              expiryDate: new Date(Date.now() + fridgeStorageTime * 24 * 60 * 60 * 1000).toISOString()
            });
          } else {
            // Add to pantry with pantry storage time
            addItem({
              name: item,
              quantity: `${quantity} item${quantity > 1 ? 's' : ''}`,
              location: 'pantry',
              expiryDate: new Date(Date.now() + pantryStorageTime * 24 * 60 * 60 * 1000).toISOString()
            });
          }

          // Create label for display
          const sourceLabel = recommendation.source 
            ? `, ${recommendation.source}` 
            : '';
              
          // Add to UI display lists
          if (isRecommendedForFridge) {
            fridgeItems.push({
              name: `${item} (${fridgeStorageTime} days${sourceLabel})`,
              quantity: quantity
            });
          } else {
            pantryItems.push({
              name: `${item} (${pantryStorageTime} days${sourceLabel})`,
              quantity: quantity
            });
          }
        } catch (err) {
          console.error(`Error fetching storage advice for ${item}:`, err);

          // Use default categorization
          const quantity = produceCounts[item] || 1;
          const isRefrigeratedItem = ['lettuce', 'berries', 'mushrooms', 'herbs'].includes(item.toLowerCase());
          const defaultStorageTime = isRefrigeratedItem ? 7 : 14;
          
          // Add to inventory even if there's an error - use addItem instead of addIdentifiedItem
          addItem({
            name: item,
            quantity: `${quantity} item${quantity > 1 ? 's' : ''}`,
            location: isRefrigeratedItem ? 'refrigerator' : 'pantry',
            expiryDate: new Date(Date.now() + defaultStorageTime * 24 * 60 * 60 * 1000).toISOString()
          });
          
          if (isRefrigeratedItem) {
            fridgeItems.push({ 
              name: `${item} (${defaultStorageTime} days, default)`, 
              quantity: quantity 
            });
          } else {
            pantryItems.push({ 
              name: `${item} (${defaultStorageTime} days, default)`, 
              quantity: quantity 
            });
          }
        }
      }
      
      setStorageRecs({
        fridge: fridgeItems,
        pantry: pantryItems,
      });
    } catch (err) {
      console.error('Error in fetchStorageRecommendations:', err);
    }
  }, [addIdentifiedItem, addItem]);

  /**
   * Updates storage recommendations state
   * 
   * @param {StorageRecommendation} newStorageRecs - New storage recommendations
   */
  const handleStorageRecsUpdate = (newStorageRecs: StorageRecommendation) => {
    setStorageRecs(newStorageRecs);
  };

  /**
   * Handles step navigation in the workflow
   * 
   * @param {number} step - The step number to navigate to
   */
  const handleStepClick = (step: number) => {
    setCurrentStep(step);
    setState(prev => ({
      ...prev,
      stream: null,
      error: null
    }));
    
    scrollToContentSection();
  };

  /**
   * Handles navigation to step 2 (Calendar Export)
   * Shows error toast if no items are in inventory
   */
  const handleStep2Click = () => {
    const items = useInventoryStore.getState().items;
    if (items.length === 0) {
      addToast({
        title: "No Items in Inventory",
        description: "Please add items to your inventory to set up expiry reminders",
        classNames: {
          base: "bg-amber-500/10 border border-amber-500",
          title: "text-amber-800 font-semibold",
          description: "text-amber-700",
          icon: "text-amber-600"
        },
        timeout: 3000
      });
      return;
    }
    setCurrentStep(2);
    scrollToContentSection();
  };

  /**
   * Generates calendar link for expiration reminders
   * 
   * @returns {Promise<void>} Promise that resolves when calendar is generated
   */
  const generateCalendarLink = async () => {
    if (calendarSelection.selectedItems.length === 0) {
      addToast({
        title: "Calendar Generation Failed",
        description: "Please select at least one item",
        classNames: {
          base: "bg-amber-500/10 border border-amber-500",
          title: "text-amber-800 font-semibold",
          description: "text-amber-700",
          icon: "text-amber-600"
        },
        timeout: 3000
      });
      return;
    }
  
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
      
      // Move to step 4
      setCurrentStep(3);
      scrollToContentSection();
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: `Calendar generation failed: ${err instanceof Error ? err.message : String(err)}`
      }));
    }
  };

  /**
   * Resets the component state
   */
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
    // Initialize from the inventory store
    const inventoryItems = useInventoryStore.getState().items;
    if (inventoryItems.length > 0) {
      // Only fetch new recommendations if we don't already have items from store
      // This prevents overwriting existing inventory data
      fetchStorageRecommendations();
    } else {
      // Otherwise just prepare an empty structure
      fetchStorageRecommendations({});
    }
    
    // Clean up camera stream on unmount
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [fetchStorageRecommendations, state.stream]);

  return (
      <div>
          <ToastProvider placement="top-center" toastOffset={80} />
          {/* Title section */}
          <div className="py-12">
            <Title heading="Food Storage Assistant" 
            description="Capture your groceries and get personalised storage recommendations and expiration reminders" 
            background="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/storageassistant-titlebg.jpeg"
            />
          </div>

          <div className="min-h-screen max-w-7xl mx-auto px-10 mb-12">
          {/* Stepper for navigation */}
            <div className="mt-8 mb-12">
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
                <div className="flex justify-between">
                  <h2 className="text-2xl font-semibold text-darkgreen mb-2">
                    Step 1: Scan your Groceries
                  </h2>
                  <InfoTooltip 
                    contentItems={[
                      "Photos taken are processed only on your device and our secure server",
                      "Images are not permanently stored and are deleted after analysis",
                      "No personal information is gathered through the camera feature",
                      "You may need to grant camera permissions in your browser settings"
                    ]}
                    header="Camera Usage Disclaimer"
                    footerText="Your privacy is our priority"
                    placement="left-start"
                    icon={faCircleExclamation}
                    ariaLabel="Disclaimer"
                  />
                </div>
                <p className="text-md text-gray-700 mb-10">
                  Take photos of your groceries to get personalised storage recommendations.
                </p>
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
                    <div className="flex justify-between">
                      <h2 className="text-2xl font-semibold text-darkgreen mb-2">
                        Step 2: Storage Recommendations
                      </h2>
                      <InfoTooltip 
                        contentItems={[
                          "Food detection and storage recommendations are handled by our AI algorithms and open data sources using anonymized data",
                          "Recommendations are provided for reference only and may not be accurate for all food items or storage conditions",
                          "Users should always use their own judgment when assessing food safety and storage",
                        ]}
                        header="For Reference Only"
                        footerText="Recommendations for reference only"
                        placement="left-start"
                        icon={faCircleExclamation}
                        ariaLabel="Disclaimer"
                      />
                    </div>
                    <p className="text-md text-gray-700 mb-10">
                      Review your grocery items with the storage recommendations and estimated expiration time.
                    </p>
                    
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
                    <div className="flex justify-center md:justify-end mt-8">
                      <Button
                        onPress={handleStep2Click}
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
                    {currentStep === 2 ? (
                      <>
                        {/* Step 3: Calendar Export Section */}
                        <div className="border-green border-2 rounded-lg p-10 mb-8">
                          <Button
                            onPress={() => setCurrentStep(1)}
                            className="text-amber-600 flex items-center cursor-pointer whitespace-nowrap bg-transparent p-0"
                          >
                            <FontAwesomeIcon icon={faArrowLeft} className="text-amber-600 mr-2" />
                            Back to Storage Recommendations
                          </Button>
                          <h2 className="text-2xl font-semibold text-darkgreen mb-2">
                            Step 3: Reminder Setup
                          </h2>
                          <p className="text-md text-gray-700 mb-10">
                            Export expiration dates reminders for your grocery items.
                          </p>
                          <CalendarExport
                            calendarSelection={calendarSelection}
                            setCalendarSelection={setCalendarSelection}
                          />
                          <div className="flex justify-center md:justify-end mt-8">
                            <Button
                              onPress={generateCalendarLink}
                              className="bg-darkgreen text-white py-2 px-8 rounded-lg"
                            >
                              <FontAwesomeIcon icon={faCalendarAlt} className="text-white"/> 
                              <p className="font-semibold text-white">Generate Calendar Reminder</p>
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Step 4: Calendar Import Section */}
                        <div className="border-green border-2 rounded-lg p-10 mb-8">
                          <Button
                            onPress={() => setCurrentStep(2)}
                            className="text-amber-600 flex items-center cursor-pointer whitespace-nowrap bg-transparent p-0"
                          >
                            <FontAwesomeIcon icon={faArrowLeft} className="text-amber-600 mr-2" />
                            Back to Reminder Setup
                          </Button>
                          <h2 className="text-2xl font-semibold text-darkgreen mb-2">
                            Step 4: Calendar Import
                          </h2>
                          <p className="text-md text-gray-700 mb-10">
                            Import your calendar file to sync your grocery items with your digital calendar.
                          </p>
                          <CalendarImport 
                            calendarLink={calendarSelection.calendarLink || ''}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}
            {/* Coming up next section */}
            {currentStep === 3 && (
              <ComingUp
                message="Your're now a Food Storage Pro!"
                title="What's Next:"
                description="Generate smart grocery lists that skip what you already have in storage."
                buttonText="Continue to Eco Grocery"
                buttonLink="/eco-grocery"
              imageSrc="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/storage-assistant-next.png"
                imageAlt="Eco Grocery"
              />
            )}
          </div>
      </div>  
  );
};

export default FoodStorageAssistant;