'use client';

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { config } from '@/config';

// Interface for camera state
interface CameraState {
  stream: MediaStream | null;
  photos: string[]; // Array of photos
  error: string | null;
  isAnalyzing: boolean;
  detections: ProduceDetections | null;
  submittedPhotos: string[]; // Store photos ready for submission
}

// Interface for produce detection results
interface ProduceDetections {
  success: boolean;
  detections: Array<{
    class: string;
    confidence: number;
    bbox: number[];
  }>;
  produce_counts: {
    [key: string]: number;
  };
  total_items: number;
}

// Interface for storage recommendation
interface StorageRecommendation {
  fridge: string[]; // Items recommended for fridge
  pantry: string[]; // Items recommended for pantry
}

// Interface for calendar selection
interface CalendarSelection {
  selectedItems: Array<{
    name: string;
    quantity: number;
    expiry_date: number;  // Changed from string to number
    reminder_days: number;
    reminder_time: string;
  }>;
  calendarLink: string | null;
  reminderDays: number;
  reminderTime: string;
}

// Interface for API response types
interface FoodTypesResponse {
  food_types: string[];
}

interface StorageAdviceResponse {
  method: number;
  storage_time: number;
}

interface CalendarResponse {
  calendar_url: string;
}

const FoodStorageAssistant: React.FC = () => {
  // Refs for video and canvas elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State for step navigation
  const [currentStep, setCurrentStep] = useState(1);
  
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

  // Check iOS security restrictions
  const checkIOSRestriction = (): boolean => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isSecure = window.isSecureContext;
    const isLocalhost = ['localhost', '127.0.0.1', '3.107.143.147'].includes(window.location.hostname);

    if (isIOS && !isSecure && !isLocalhost) {
      setState(prev => ({
        ...prev,
        error: "iOS requires HTTPS or localhost for camera access\nSolutions:\n1. Use HTTPS URL in Safari\n2. Test with localhost during development"
      }));
      return true;
    }
    return false;
  };

  // Initialize camera stream
  const startCamera = async () => {
    if (checkIOSRestriction()) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera for better produce shots
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setState(prev => ({
        ...prev,
        stream,
        error: null
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: `Camera access denied: ${err instanceof Error ? err.message : String(err)}`
      }));
    }
  };

  // Capture photo from video stream
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !state.stream) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoData = canvas.toDataURL('image/jpeg', 0.9);
      
      // Add new photo to the photos array
      setState(prev => ({
        ...prev,
        photos: [...prev.photos, photoData],
        detections: null // Clear previous detections
      }));
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
      setState(prev => ({
        ...prev,
        stream: null,
        photos: [], // Clear all photos when stopping camera
        detections: null
      }));
    }
  };

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

      // Move to step 2 after submission
      setCurrentStep(2);

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
            const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
              food_type: matchedType
            });
            
            const recommendation = response.data;

            if (recommendation.method === 1) {
              fridgeItems.push(`${item} (${recommendation.storage_time} days)`);

              toggleItemSelection(item, produceCounts[item] || 1, recommendation.storage_time);
            } else if (recommendation.method === 2) {
              pantryItems.push(`${item} (${recommendation.storage_time} days)`);

              toggleItemSelection(item, produceCounts[item] || 1, recommendation.storage_time);
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

  // Calculate expiry date based on storage time
  const calculateExpiryDate = (storageTime: number): number => {
    return storageTime;
  };

  // Toggle item selection for calendar
  const toggleItemSelection = (item: string, quantity: number, storageTime: number) => {
    setCalendarSelection(prev => {
      const existingIndex = prev.selectedItems.findIndex(i => i.name === item);
      
      if (existingIndex >= 0) {
        const newSelectedItems = [...prev.selectedItems];
        newSelectedItems.splice(existingIndex, 1);
        return { ...prev, selectedItems: newSelectedItems };
      } else {
        const newItem = {
          name: item,
          quantity,
          expiry_date: calculateExpiryDate(storageTime),
          reminder_days: prev.reminderDays,
          reminder_time: prev.reminderTime
        };
        return { ...prev, selectedItems: [...prev.selectedItems, newItem] };
      }
    });
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

  // Copy calendar link to clipboard
  const copyCalendarLink = () => {
    if (calendarSelection.calendarLink) {
      navigator.clipboard.writeText(calendarSelection.calendarLink);
      alert('Calendar link copied to clipboard!');
    }
  };

  // Step navigation - allow users to jump to any step
  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  // Reset functionality
  const handleReset = () => {
    stopCamera();
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Food Storage Assistant
        </h1>
        
        {/* Reset button */}
        <button
          onClick={handleReset}
          className="mb-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Reset
        </button>
        
        {/* Error message display */}
        {state.error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md mb-5 border-l-4 border-red-500">
            {state.error.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}
        
        {/* Step Navigation */}
        <div className="flex mb-8 bg-white rounded-lg shadow-sm p-2">
          <div
            className={`flex-1 py-3 px-4 rounded-md cursor-pointer flex items-center justify-center ${currentStep === 1 ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            onClick={() => handleStepClick(1)}
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-blue-500 font-bold mr-2">
              1
            </span>
            <span className="font-medium">Capture Food Items</span>
          </div>
          <div
            className={`flex-1 py-3 px-4 rounded-md cursor-pointer flex items-center justify-center ${currentStep === 2 ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            onClick={() => handleStepClick(2)}
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-blue-500 font-bold mr-2">
              2
            </span>
            <span className="font-medium">Storage Recommendations</span>
          </div>
        </div>
        
        {/* Step 1: Camera and Photo Capture */}
        {currentStep === 1 ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">
              Step 1: Capture Food Items
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                {/* Camera preview */}
                <div className="bg-gray-900 rounded-lg overflow-hidden relative h-96">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ display: state.stream ? 'block' : 'none' }}
                  />
                  {!state.stream && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      Camera inactive
                    </div>
                  )}
                  
                  {/* Camera controls overlay */}
                  {state.stream && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                      <button
                        onClick={takePhoto}
                        className="bg-white text-gray-900 px-4 py-2 rounded-full shadow-lg hover:bg-gray-100 transition"
                        disabled={state.isAnalyzing}
                      >
                        Take Photo
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Hidden canvas for image capture */}
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Camera control buttons */}
                <div className="mt-4 flex justify-center">
                  {!state.stream ? (
                    <button
                      onClick={startCamera}
                      className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition"
                      disabled={state.isAnalyzing}
                    >
                      Start Camera
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition mx-2"
                      disabled={state.isAnalyzing}
                    >
                      Stop Camera
                    </button>
                  )}
                </div>
              </div>
              
              <div className="w-full md:w-96">
                <div className="bg-gray-50 rounded-t-lg p-4 border border-gray-200 border-b-0">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    Captured Photos ({state.photos.length})
                  </h3>
                  
                  {/* Photo gallery */}
                  {state.photos.length === 0 ? (
                    <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
                      <p className="text-gray-500 italic">
                        No photos captured yet
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto p-2">
                      {state.photos.map((photo, index) => (
                        <div
                          key={index}
                          className="relative bg-white rounded-lg overflow-hidden shadow-sm"
                        >
                          <img
                            src={photo}
                            alt={`Captured item ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                          <span className="absolute bottom-0 right-0 bg-black/70 text-white text-xs py-1 px-2 rounded-tl-md">
                            #{index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Analyze Photos Button - INSIDE THE PHOTO GALLERY CONTAINER */}
                <div className="mt-0 bg-gray-50 rounded-b-lg p-4 border border-gray-200 border-t-0">
                  <button
                    onClick={submitPhotos}
                    className="w-full bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition font-medium"
                    disabled={state.photos.length === 0 || state.isAnalyzing}
                  >
                    {state.isAnalyzing ? 'Analyzing...' : 'Analyze Photos'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Refrigerator section */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-xl font-medium text-gray-700 mb-4">
                    Refrigerator
                  </h3>
                  <div className="bg-white rounded-lg p-4 min-h-64">
                    {storageRecs.fridge.length > 0 ? (
                      <ul className="space-y-3">
                        {storageRecs.fridge.map((item, index) => (
                          <li key={index} className="flex items-center p-2 border-b border-gray-100 last:border-0">
                            <span className="text-green-500 mr-2">&#8226;</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic text-center">
                        No items recommended for refrigerator
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Pantry section */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-xl font-medium text-gray-700 mb-4">
                    Pantry
                  </h3>
                  <div className="bg-white rounded-lg p-4 min-h-64">
                    {storageRecs.pantry.length > 0 ? (
                      <ul className="space-y-3">
                        {storageRecs.pantry.map((item, index) => (
                          <li key={index} className="flex items-center p-2 border-b border-gray-100 last:border-0">
                            <span className="text-amber-500 mr-2">&#8226;</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic text-center">
                        No items recommended for pantry
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Calendar Export Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                Calendar Export
              </h2>
              <div className="bg-gray-50 rounded-lg p-5 mb-6">
                <h3 className="text-xl font-medium text-gray-700 mb-4">
                  Reminder Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="days-before"
                      className="block text-gray-700 mb-2"
                    >
                      Days before expiry:
                    </label>
                    <div className="relative">
                      <select
                        id="days-before"
                        className="w-full p-3 bg-white border border-gray-300 rounded-md appearance-none pr-10"
                        value={calendarSelection.reminderDays}
                        onChange={(e) => setCalendarSelection(prev => ({
                          ...prev,
                          reminderDays: parseInt(e.target.value)
                        }))}
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map(days => (
                          <option key={days} value={days}>{days} day{days !== 1 ? 's' : ''} before</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="reminder-time"
                      className="block text-gray-700 mb-2"
                    >
                      Reminder time:
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        id="reminder-time"
                        className="w-full p-3 bg-white border border-gray-300 rounded-md"
                        value={calendarSelection.reminderTime}
                        onChange={(e) => setCalendarSelection(prev => ({
                          ...prev,
                          reminderTime: e.target.value
                        }))}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Item Selection */}
                <div>
                  <h3 className="text-xl font-medium text-gray-700 mb-4">
                    Select Items for Reminders
                  </h3>
                  {state.detections?.produce_counts ? (
                    <div className="bg-white rounded-lg p-4 min-h-40 max-h-80 overflow-y-auto">
                      <ul className="space-y-2">
                        {Object.entries(state.detections.produce_counts).map(([item, count]) => (
                          <li key={item} className="py-2 border-b border-gray-100 last:border-0">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={calendarSelection.selectedItems.some(i => i.name === item)}
                                onChange={() => {
                                  // Find the storage time for this item
                                  const storageTime = 7; // Default to 7 days if not found
                                  toggleItemSelection(item, count, storageTime);
                                }}
                                className="mr-2"
                              />
                              <span className="text-gray-800">
                                {item} (Qty: {count})
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 min-h-40 flex items-center justify-center">
                      <p className="text-gray-500 italic">
                        Take and submit photos to see items
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Calendar Link */}
                <div>
                  <h3 className="text-xl font-medium text-gray-700 mb-4">
                    Your Calendar Link
                  </h3>
                  {calendarSelection.calendarLink ? (
                    <div className="bg-white rounded-lg p-4 min-h-40">
                      <div className="flex gap-2 mt-4">
                        <input
                          type="text"
                          value={calendarSelection.calendarLink}
                          readOnly
                          className="flex-1 p-3 border border-gray-300 rounded-md text-sm"
                        />
                        <button
                          onClick={copyCalendarLink}
                          className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors min-w-20"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 min-h-40 flex items-center justify-center">
                      <p className="text-gray-500 italic">
                        {calendarSelection.selectedItems.length > 0
                          ? 'Click "Generate Calendar Link"'
                          : 'Select items first'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={generateCalendarLink}
                  disabled={!state.detections || calendarSelection.selectedItems.length === 0}
                  className={`w-full py-4 rounded-md text-white font-medium ${
                    !state.detections || calendarSelection.selectedItems.length === 0
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-amber-500 hover:bg-amber-600 transition"
                  }`}
                >
                  Generate Calendar Link
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FoodStorageAssistant;