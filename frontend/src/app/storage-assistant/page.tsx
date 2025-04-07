'use client';

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import styles from './StorageAssistant.module.css';
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
    reminderDays: 2, // 默认提前2天提醒
    reminderTime: "20:00", // 默认晚上8点提醒
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 默认7天后过期
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

  // Submit all captured photos for analysis
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
    <div className={styles.container}>
      <h1 className={styles.header}>Food Produce Scanner</h1>
      
      {/* Error message display */}
      {state.error && (
        <div className={styles.error}>
          {state.error.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
  
      <div className={styles.mainContent}>
        {/* Left column - camera and controls */}
        <div className={styles.cameraColumn}>
          {/* Camera preview area */}
          <div className={styles.cameraPreview}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={styles.video}
              style={{ display: state.stream ? 'block' : 'none' }}
            />
            {!state.stream && (
              <div className={styles.placeholder}>Camera inactive</div>
            )}
          </div>
  
          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
  
          {/* Camera control buttons */}
          <div className={styles.controls}>
            {!state.stream ? (
              <button
                onClick={startCamera}
                className={`${styles.button} ${styles.primaryButton}`}
                disabled={state.isAnalyzing}
              >
                Start Camera
              </button>
            ) : (
              <>
                <button 
                  onClick={takePhoto} 
                  className={`${styles.button} ${styles.captureButton}`}
                  disabled={state.isAnalyzing}
                >
                  Capture Photo
                </button>
                <button 
                  onClick={stopCamera} 
                  className={`${styles.button} ${styles.secondaryButton}`}
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
              className={`${styles.button} ${styles.submitButton}`}
              disabled={state.isAnalyzing}
            >
              {state.isAnalyzing ? 'Analyzing...' : `Submit ${state.photos.length} Photo(s)`}
            </button>
          )}
        </div>
  
        {/* Right column - photo previews */}
        <div className={styles.photosColumn}>
          <h3>Captured Photos ({state.photos.length})</h3>
          {state.photos.length > 0 ? (
            <div className={styles.photoGrid}>
              {state.photos.map((photo, index) => (
                <div key={index} className={styles.photoContainer}>
                  <img 
                    src={photo} 
                    alt={`Captured ${index + 1}`} 
                    className={styles.thumbnail} 
                  />
                  <span className={styles.photoIndex}>#{index + 1}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyMessage}>No photos captured yet</p>
          )}
        </div>
      </div>
  
      {/* Storage Recommendations Section - Always Visible */}
      <div className={styles.storageSection}>
        <h2>Storage Recommendations</h2>
        <div className={styles.storageTabs}>
          <button
            onClick={() => setActiveTab('fridge')}
            className={activeTab === 'fridge' ? styles.activeTab : ''}
          >
            Refrigerator
          </button>
          <button
            onClick={() => setActiveTab('pantry')}
            className={activeTab === 'pantry' ? styles.activeTab : ''}
          >
            Pantry
          </button>
        </div>
  
        <div className={styles.storageContent}>
          {activeTab === 'fridge' ? (
            <ul className={styles.storageList}>
              {storageRecs.fridge.length > 0 ? (
                storageRecs.fridge.map((item, index) => (
                  <li key={index} className={styles.storageItem}>
                    {item}
                  </li>
                ))
              ) : (
                <li className={styles.emptyMessage}>No items recommended for refrigerator</li>
              )}
            </ul>
          ) : (
            <ul className={styles.storageList}>
              {storageRecs.pantry.length > 0 ? (
                storageRecs.pantry.map((item, index) => (
                  <li key={index} className={styles.storageItem}>
                    {item}
                  </li>
                ))
              ) : (
                <li className={styles.emptyMessage}>No items recommended for pantry</li>
              )}
            </ul>
          )}
        </div>
      </div>
  
      {/* Calendar Export Section - Always Visible */}
      <div className={styles.calendarSection}>
        <h2>Calendar Export</h2>
        <div className={styles.reminderSettings}>
          <h3>Reminder Settings</h3>
          <div className={styles.settingRow}>
            <label>
              Days before expiry:
              <select
                value={calendarSelection.reminderDays}
                onChange={(e) => setCalendarSelection(prev => ({
                  ...prev,
                  reminderDays: parseInt(e.target.value)
                }))}
                className={styles.timeSelect}
              >
                {[1, 2, 3, 4, 5, 6, 7].map(days => (
                  <option key={days} value={days}>{days} day{days !== 1 ? 's' : ''} before</option>
                ))}
              </select>
            </label>
            
            <label>
              Reminder time:
              <input
                type="time"
                value={calendarSelection.reminderTime}
                onChange={(e) => setCalendarSelection(prev => ({
                  ...prev,
                  reminderTime: e.target.value
                }))}
                className={styles.timeInput}
              />
            </label>
            
            <label>
              Default expiry date:
              <input
                type="date"
                value={calendarSelection.expiryDate}
                onChange={(e) => setCalendarSelection(prev => ({
                  ...prev,
                  expiryDate: e.target.value
                }))}
                className={styles.dateInput}
                min={new Date().toISOString().split('T')[0]}
              />
            </label>
          </div>
        </div>
        <div className={styles.calendarContent}>
          <div className={styles.selectionPanel}>
            <h3>Select Items for Reminders</h3>
            {state.detections?.produce_counts ? (
              <ul className={styles.itemList}>
                {Object.entries(state.detections.produce_counts).map(([item, count]) => (
                  <li key={item} className={styles.itemRow}>
                    <label>
                      <input
                        type="checkbox"
                        checked={calendarSelection.selectedItems.some(i => i.name === item)}
                        onChange={() => toggleItemSelection(item, count)}
                        className={styles.checkbox}
                      />
                      <span className={styles.itemName}>
                        {item} (Qty: {count})
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyMessage}>Take and submit photos to see items</p>
            )}
  
            <button
              onClick={generateCalendarLink}
              disabled={!state.detections || calendarSelection.selectedItems.length === 0}
              className={`${styles.button} ${styles.generateButton}`}
            >
              Generate Calendar Link
            </button>
          </div>
  
          <div className={styles.linkPanel}>
            <h3>Your Calendar Link</h3>
            {calendarSelection.calendarLink ? (
              <div className={styles.linkContainer}>
                <input
                  type="text"
                  value={calendarSelection.calendarLink}
                  readOnly
                  className={styles.linkInput}
                />
                <button
                  onClick={copyCalendarLink}
                  className={`${styles.button} ${styles.copyButton}`}
                >
                  Copy
                </button>
              </div>
            ) : (
              <p className={styles.emptyMessage}>
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