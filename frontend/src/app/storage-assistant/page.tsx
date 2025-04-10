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

  // Submit photos for analysis
  const submitPhotos = async () => {
    if (state.photos.length === 0) return;

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      // Call API endpoint for produce detection with all photos
      const response = await axios.post(`${config.apiUrl}/api/detect-produce/`, {
        images: state.photos // Send array of photos
      });

      setState(prev => ({
        ...prev,
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
      // Get all food types
      const foodTypesResponse = await axios.get<FoodTypesResponse>(`${config.apiUrl}/api/food-types/`);
      const allFoodTypes = foodTypesResponse.data.food_types;
      
      // If no food detected, use empty array
      const allItems = Object.keys(produceCounts).length > 0
        ? Object.keys(produceCounts)
        : [];
      
      // Get storage advice for each item
      const fridgeItems: string[] = [];
      const pantryItems: string[] = [];
      
      for (const item of allItems) {
        try {
          // Find best matching food type
          const matchedType = allFoodTypes.find((type: string) => 
            type.toLowerCase().includes(item.toLowerCase()) || 
            item.toLowerCase().includes(type.toLowerCase())
          );
          
          if (matchedType) {
            const response = await axios.get<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
              params: { food_type: matchedType }
            });
            
            const recommendation = response.data;

            if (recommendation.method === 1) {
              fridgeItems.push(`${item} (${recommendation.storage_time} days)`);
            } else if (recommendation.method === 2) {
              pantryItems.push(`${item} (${recommendation.storage_time} days)`);
            }
          } else {
            if (['lettuce', 'berries', 'mushrooms', 'herbs'].includes(item.toLowerCase())) {
              fridgeItems.push(item);
            } else {
              pantryItems.push(item);
            }
          }
        } catch (err) {
          console.error(`Error fetching storage advice for ${item}:`, err);

          // Use default categorization
          if (['lettuce', 'berries', 'mushrooms', 'herbs'].includes(item.toLowerCase())) {
            fridgeItems.push(item);
          } else {
            pantryItems.push(item);
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
      
      const fridgeItems = allItems.filter(item =>
        ['lettuce', 'berries', 'mushrooms', 'herbs'].includes(item.toLowerCase())
      );
      
      const pantryItems = allItems.filter(item =>
        !['lettuce', 'berries', 'mushrooms', 'herbs'].includes(item.toLowerCase())
      );
      
      setStorageRecs({
        fridge: fridgeItems,
        pantry: pantryItems,
      });
    }
  };

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
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
    }
    setState(prev => ({
      ...prev,
      photos: [],
      detections: null,
      submittedPhotos: [],
      error: null
    }));
    setCurrentStep(1);
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
            <Camera state={state} setState={setState} submitPhotos={submitPhotos} />
          </div>
        ) : (
          <>
          {currentStep === 1 ? (
            <>
            {/* Step 2: Storage Recommendations */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-700">
                  Step 2: Storage Recommendations
                </h2>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Back to Camera
                </button>
              <StorageRecommendations storageRecs={storageRecs} />
              </div>
            </div>
            </>
            ) : (
              <>
            {/* Calendar Export Section */}
            <CalendarExport
              calendarSelection={calendarSelection}
              setCalendarSelection={setCalendarSelection}
              detections={state.detections}
              generateCalendarLink={generateCalendarLink}
            />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default FoodStorageAssistant;