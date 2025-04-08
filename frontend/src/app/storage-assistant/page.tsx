'use client';

import React from "react";
import styles from './StorageAssistant.module.css';
import { useCamera } from './hooks/useCamera';
import { useStorageRecommendations } from './hooks/useStorageRecommendations';
import { useCalendar } from './hooks/useCalendar';
import CameraSection from './components/CameraSection';
import PhotoPreview from './components/PhotoPreview';
import StorageRecommendations from './components/StorageRecommendations';
import CalendarExport from './components/CalendarExport';
import { CameraState, ProduceDetections } from './types';

const StorageAssistant: React.FC = () => {
  const {
    videoRef,
    canvasRef,
    state,
    startCamera,
    takePhoto,
    stopCamera,
    submitPhotos
  } = useCamera();

  const {
    storageRecs,
    fetchStorageRecommendations
  } = useStorageRecommendations();

  const {
    calendarSelection,
    setCalendarSelection,
    toggleItemSelection,
    generateCalendarLink,
    copyCalendarLink
  } = useCalendar();

  // Handle photo submission and update storage recommendations
  const handlePhotoSubmission = async () => {
    const detections = await submitPhotos();
    if (detections) {
      await fetchStorageRecommendations(detections.produce_counts);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Food Produce Scanner</h1>
      
      {/* Error message display */}
      {state.error && (
        <div className={styles.error}>
          {state.error.split('\n').map((line: string, i: number) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <div className={styles.mainContent}>
        <CameraSection
          videoRef={videoRef as React.RefObject<HTMLVideoElement>}
          canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
          state={state as CameraState}
          startCamera={startCamera}
          takePhoto={takePhoto}
          stopCamera={stopCamera}
          submitPhotos={handlePhotoSubmission}
        />
        
        <PhotoPreview state={state as CameraState} />
      </div>

      {/* Storage Recommendations Section */}
      {(storageRecs.fridge.length > 0 || storageRecs.pantry.length > 0) && (
        <StorageRecommendations storageRecs={storageRecs} />
      )}

      {/* Calendar Export Section */}
      <CalendarExport
        calendarSelection={calendarSelection}
        setCalendarSelection={setCalendarSelection}
        detections={state.detections}
        toggleItemSelection={toggleItemSelection}
        generateCalendarLink={async () => { await generateCalendarLink(); }}
        copyCalendarLink={copyCalendarLink}
        storageRecs={storageRecs}
      />
    </div>
  );
};

export default StorageAssistant;