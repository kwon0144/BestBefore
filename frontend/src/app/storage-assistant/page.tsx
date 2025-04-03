'use client';

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import styles from './StorageAssistant.module.css';

interface CameraState {
  stream: MediaStream | null;
  photo: string | null;
  error: string | null;
  isUploading: boolean;
  uploadSuccess: boolean;
}

const StorageAssistant: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<CameraState>({
    stream: null,
    photo: null,
    error: null,
    isUploading: false,
    uploadSuccess: false
  });

  // Check iOS security restrictions
  const checkIOSRestriction = (): boolean => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isSecure = window.isSecureContext;
    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

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
          facingMode: 'environment'
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
      setState(prev => ({
        ...prev,
        photo: canvas.toDataURL('image/jpeg', 0.9)
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
        photo: null
      }));
    }
  };

  // Upload captured photo
  const uploadPhoto = async () => {
    if (!state.photo) return;

    setState(prev => ({ ...prev, isUploading: true }));

    try {
      const blob = await fetch(state.photo).then(res => res.blob());
      const formData = new FormData();
      formData.append('photo', blob, 'photo.jpg');

      await axios.post('/api/upload', formData);
      
      setState(prev => ({
        ...prev,
        uploadSuccess: true,
        isUploading: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: `Upload failed: ${err instanceof Error ? err.message : String(err)}`,
        isUploading: false
      }));
    }
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
      <h1 className={styles.header}>Camera Upload Assistant</h1>
      
      {/* Error message display */}
      {state.error && (
        <div className={styles.error}>
          {state.error.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
      
      {/* Success notification */}
      {state.uploadSuccess && (
        <div className={styles.success}>Photo uploaded successfully!</div>
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

      {/* Camera control buttons */}
      <div className={styles.controls}>
        {!state.stream ? (
          <button
            onClick={startCamera}
            className={`${styles.button} ${styles.primaryButton}`}
            disabled={state.isUploading}
          >
            Start Camera
          </button>
        ) : (
          <>
            <button 
              onClick={takePhoto} 
              className={`${styles.button} ${styles.captureButton}`}
            >
              Capture Photo
            </button>
            <button 
              onClick={stopCamera} 
              className={`${styles.button} ${styles.secondaryButton}`}
            >
              Stop Camera
            </button>
          </>
        )}
      </div>

      {/* Photo preview and upload section */}
      {state.photo && (
        <div className={styles.previewSection}>
          <h3>Photo Preview</h3>
          <img 
            src={state.photo} 
            alt="Preview" 
            className={styles.previewImage} 
          />
          <button
            onClick={uploadPhoto}
            className={`${styles.button} ${styles.uploadButton}`}
            disabled={state.isUploading}
          >
            {state.isUploading ? 'Uploading...' : 'Upload Photo'}
          </button>
        </div>
      )}
    </div>
  );
};

export default StorageAssistant;