'use client';

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import styles from './StorageAssistant.module.css';
import { config } from '@/config';

interface CameraState {
  stream: MediaStream | null;
  photo: string | null;
  error: string | null;
  isAnalyzing: boolean;
  detections: ProduceDetections | null;
}

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

const StorageAssistant: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<CameraState>({
    stream: null,
    photo: null,
    error: null,
    isAnalyzing: false,
    detections: null
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
      setState(prev => ({
        ...prev,
        photo: photoData,
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
        photo: null,
        detections: null
      }));
    }
  };

  // Analyze photo for produce detection
  const analyzePhoto = async () => {
    if (!state.photo) return;

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      // Call Django API endpoint for produce detection
      const response = await axios.post(`${config.apiUrl}/api/detect-produce/`, {
        image: state.photo
      });

      
      setState(prev => ({
        ...prev,
        detections: response.data as ProduceDetections,
        isAnalyzing: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: `Analysis failed: ${err instanceof Error ? err.message : String(err)}`,
        isAnalyzing: false
      }));
    }
  };

  // Render produce detection results
  const renderDetectionResults = () => {
    if (!state.detections) return null;
    
    const { produce_counts, total_items } = state.detections;
    
    return (
      <div className={styles.detectionResults}>
        <h3>Detected Produce</h3>
        
        {total_items > 0 ? (
          <>
            <ul className={styles.produceList}>
              {Object.entries(produce_counts).map(([produce, count]) => (
                <li key={produce} className={styles.produceItem}>
                  <span className={styles.produceName}>{produce}</span>
                  <span className={styles.produceCount}>{count}</span>
                </li>
              ))}
            </ul>
            <div className={styles.totalItems}>
              <strong>Total Items:</strong> {total_items}
            </div>
          </>
        ) : (
          <p>No produce items detected. Try taking another photo with clearer view of the items.</p>
        )}
      </div>
    );
  };

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [state.stream]);

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

      {/* Photo preview and analysis section */}
      {state.photo && (
        <div className={styles.previewSection}>
          <h3>Photo Preview</h3>
          <img 
            src={state.photo} 
            alt="Preview" 
            className={styles.previewImage} 
          />
          
          {/* Analysis controls */}
          <div className={styles.analysisControls}>
            {!state.detections && !state.isAnalyzing && (
              <button
                onClick={analyzePhoto}
                className={`${styles.button} ${styles.analyzeButton}`}
              >
                Analyze Produce
              </button>
            )}
            
            {state.isAnalyzing && (
              <div className={styles.analyzing}>
                <p>Analyzing your produce...</p>
                <div className={styles.spinner}></div>
              </div>
            )}
            
            {renderDetectionResults()}
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageAssistant;