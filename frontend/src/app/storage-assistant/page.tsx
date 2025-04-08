'use client';

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { config } from '@/config';

// Interface for camera state
interface CameraState {
  stream: MediaStream | null;
  photos: string[]; // Changed from single photo to array of photos
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
    expiry_date: string;
    reminder_days: number;
    reminder_time: string;
  }>;
  calendarLink: string | null;
  reminderDays: number;
  reminderTime: string;
  expiryDate: string;
}

const StorageAssistant: React.FC = () => {
  // Refs for video and canvas elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [calendarSelection, setCalendarSelection] = useState<CalendarSelection>({
    selectedItems: [],
    calendarLink: null,
    reminderDays: 2, // Default 2 days reminder
    reminderTime: "20:00", // Default 8 PM reminder
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 7 days expiry
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

  // State for storage recommendations (to be fetched from backend)
  const [storageRecs, setStorageRecs] = useState<StorageRecommendation>({
    fridge: [],
    pantry: []
  });

  // State for active tab in storage display
  const [activeTab, setActiveTab] = useState<'fridge' | 'pantry'>('fridge');

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

  const submitPhotos = async () => {
    if (state.photos.length === 0) return;

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      // Call Django API endpoint for produce detection with all photos
      const response = await axios.post(`${config.apiUrl}/api/detect-produce/`, {
        images: state.photos // Send array of photos
      });

      setState(prev => ({
        ...prev,
        detections: response.data as ProduceDetections,
        isAnalyzing: false,
        submittedPhotos: [...prev.photos] // Store submitted photos
      }));

      // After submission, fetch storage recommendations
      // This is a mock - replace with actual API call
      fetchStorageRecommendations((response.data as ProduceDetections).produce_counts);
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: `Analysis failed: ${err instanceof Error ? err.message : String(err)}`,
        isAnalyzing: false
      }));
    }
  };

  // Mock function to fetch storage recommendations
  const fetchStorageRecommendations = (
    produceCounts: { [key: string]: number } = {}
  ) => {
    const allItems = Object.keys(produceCounts).length > 0
      ? Object.keys(produceCounts)
      : ['apple', 'banana', 'carrot']; 
  
    const fridgeItems = allItems.filter(item =>
      ['lettuce', 'berries', 'mushrooms', 'herbs'].includes(item.toLowerCase())
    );
    const pantryItems = allItems.filter(item =>
      ['potatoes', 'onions', 'garlic', 'tomatoes'].includes(item.toLowerCase())
    );
  
    setStorageRecs({
      fridge: fridgeItems,
      pantry: pantryItems,
    });
  };

  // Toggle item selection for calendar
  const toggleItemSelection = (item: string, quantity: number) => {
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
          expiry_date: prev.expiryDate,
          reminder_days: prev.reminderDays,
          reminder_time: prev.reminderTime
        };
        return { ...prev, selectedItems: [...prev.selectedItems, newItem] };
      }
    });
  };

  const generateCalendarLink = async () => {
    if (calendarSelection.selectedItems.length === 0) return;
  
    try {
      const response = await axios.post(`${config.apiUrl}/api/generate_calendar/`, {
        items: calendarSelection.selectedItems,
        reminder_days: calendarSelection.reminderDays,
        reminder_time: calendarSelection.reminderTime
      });
  
      setCalendarSelection(prev => ({
        ...prev,
        calendarLink: (response.data as { calendar_url: string }).calendar_url
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

  // Clean up camera stream on unmount
  useEffect(() => {
    fetchStorageRecommendations();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-5 font-sans bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-center text-2xl font-semibold text-gray-800 mb-8">Food Produce Scanner</h1>
      
      {/* Error message display */}
      {state.error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-5 border-l-4 border-red-500">
          {state.error.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Left column - camera and controls */}
        <div className="flex-1 min-w-0">
          {/* Camera preview area */}
          <div className="relative w-full max-w-xl mx-auto mb-5 bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full ${state.stream ? 'block' : 'hidden'}`}
            />
            {!state.stream && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-800">
                Camera inactive
              </div>
            )}
          </div>
  
          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} className="hidden" />
  
          {/* Camera control buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-5">
            {!state.stream ? (
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors min-w-40 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={state.isAnalyzing}
              >
                Start Camera
              </button>
            ) : (
              <>
                <button 
                  onClick={takePhoto} 
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors min-w-40 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={state.isAnalyzing}
                >
                  Capture Photo
                </button>
                <button 
                  onClick={stopCamera} 
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors min-w-40 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={state.isAnalyzing}
                >
                  Stop Camera
                </button>
              </>
            )}
          </div>
  
          {/* Submit button */}
          {state.photos.length > 0 && (
            <button
              onClick={submitPhotos}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={state.isAnalyzing}
            >
              {state.isAnalyzing ? 'Analyzing...' : `Submit ${state.photos.length} Photo(s)`}
            </button>
          )}
        </div>
  
        {/* Right column - photo previews */}
        <div className="flex-1 min-w-0 bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Captured Photos ({state.photos.length})</h3>
          {state.photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              {state.photos.map((photo, index) => (
                <div key={index} className="relative rounded-md overflow-hidden aspect-square shadow-sm">
                  <img 
                    src={photo} 
                    alt={`Captured ${index + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                  <span className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded-tl-md">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center italic p-5 bg-gray-50 rounded-md">
              No photos captured yet
            </p>
          )}
        </div>
      </div>
  
      {/* Storage Recommendations Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Storage Recommendations</h2>
        <div className="flex border-b mb-5">
          <button
            onClick={() => setActiveTab('fridge')}
            className={`py-2 px-4 font-medium transition-colors ${
              activeTab === 'fridge' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            Refrigerator
          </button>
          <button
            onClick={() => setActiveTab('pantry')}
            className={`py-2 px-4 font-medium transition-colors ${
              activeTab === 'pantry' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            Pantry
          </button>
        </div>
  
        <div>
          {activeTab === 'fridge' ? (
            <ul className="divide-y divide-gray-100">
              {storageRecs.fridge.length > 0 ? (
                storageRecs.fridge.map((item, index) => (
                  <li key={index} className="py-3 px-2">
                    {item}
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic text-center py-4">
                  No items recommended for refrigerator
                </li>
              )}
            </ul>
          ) : (
            <ul className="divide-y divide-gray-100">
              {storageRecs.pantry.length > 0 ? (
                storageRecs.pantry.map((item, index) => (
                  <li key={index} className="py-3 px-2">
                    {item}
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic text-center py-4">
                  No items recommended for pantry
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
  
      {/* Calendar Export Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Calendar Export</h2>
        
        <div className="bg-gray-50 p-4 rounded-md mb-5">
          <h3 className="text-lg font-medium mb-2">Reminder Settings</h3>
          <div className="flex flex-wrap gap-5 mt-3">
            <label className="flex items-center gap-2">
              Days before expiry:
              <select
                value={calendarSelection.reminderDays}
                onChange={(e) => setCalendarSelection(prev => ({
                  ...prev,
                  reminderDays: parseInt(e.target.value)
                }))}
                className="p-2 border border-gray-300 rounded-md text-sm"
              >
                {[1, 2, 3, 4, 5, 6, 7].map(days => (
                  <option key={days} value={days}>{days} day{days !== 1 ? 's' : ''} before</option>
                ))}
              </select>
            </label>
            
            <label className="flex items-center gap-2">
              Reminder time:
              <input
                type="time"
                value={calendarSelection.reminderTime}
                onChange={(e) => setCalendarSelection(prev => ({
                  ...prev,
                  reminderTime: e.target.value
                }))}
                className="p-2 border border-gray-300 rounded-md text-sm"
              />
            </label>
            
            <label className="flex items-center gap-2">
              Default expiry date:
              <input
                type="date"
                value={calendarSelection.expiryDate}
                onChange={(e) => setCalendarSelection(prev => ({
                  ...prev,
                  expiryDate: e.target.value
                }))}
                className="p-2 border border-gray-300 rounded-md text-sm"
                min={new Date().toISOString().split('T')[0]}
              />
            </label>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium mb-3">Select Items for Reminders</h3>
            {state.detections?.produce_counts ? (
              <ul className="divide-y divide-gray-100">
                {Object.entries(state.detections.produce_counts).map(([item, count]) => (
                  <li key={item} className="py-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={calendarSelection.selectedItems.some(i => i.name === item)}
                        onChange={() => toggleItemSelection(item, count)}
                        className="mr-3"
                      />
                      <span>
                        {item} (Qty: {count})
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic text-center py-4 bg-gray-50 rounded-md">
                Take and submit photos to see items
              </p>
            )}
  
            <button
              onClick={generateCalendarLink}
              disabled={!state.detections || calendarSelection.selectedItems.length === 0}
              className="w-full mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Generate Calendar Link
            </button>
          </div>
  
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium mb-3">Your Calendar Link</h3>
            {calendarSelection.calendarLink ? (
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={calendarSelection.calendarLink}
                  readOnly
                  className="flex-1 p-3 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={copyCalendarLink}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors"
                >
                  Copy
                </button>
              </div>
            ) : (
              <p className="text-gray-500 italic text-center py-4 bg-gray-50 rounded-md">
                {calendarSelection.selectedItems.length > 0
                  ? 'Click "Generate Calendar Link"'
                  : 'Select items first'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageAssistant;