import React, { useRef } from 'react';
import { CameraState } from '../interfaces';
import { Button } from '@heroui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faImage, faTrash, faTimes, faStop } from '@fortawesome/free-solid-svg-icons';

interface CameraProps {
  state: CameraState;
  setState: React.Dispatch<React.SetStateAction<CameraState>>;
  submitPhotos: () => void;
  handleReset: () => void;
}

const Camera: React.FC<CameraProps> = ({ state, setState, submitPhotos, handleReset }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        stream: null
      }));
    }
  };

  // Delete a specific photo
  const deletePhoto = (indexToDelete: number) => {
    setState(prev => ({
      ...prev,
      photos: prev.photos.filter((_, index) => index !== indexToDelete)
    }));
  };

  return (
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
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2A5F5E]/10 flex items-center justify-center">
                <FontAwesomeIcon icon={faCamera} className="text-2xl text-gray-400" />
              </div>
              <p className="text-gray-300 text-lg animate-pulse">
                Camera inactive
              </p>
            </div>
          )}
        </div>
        
        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Camera control buttons */}
        <div className="mt-4 flex justify-center gap-4">
          {!state.stream ? (
            <Button
              onPress={startCamera}
              className="bg-green text-white px-6 py-3 rounded-md"
              disabled={state.isAnalyzing}
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCamera} className="text-lg text-white" /> <p>Start Camera</p>
              </div>
            </Button>
          ) : (
            <>
              <Button
                onPress={takePhoto}
                className="bg-green text-white px-5 py-2 rounded-md flex items-center gap-2"
                disabled={state.isAnalyzing}
              >
                <FontAwesomeIcon icon={faCamera} className="text-white" />
                <span>Capture</span>
              </Button>
              <Button
                onPress={stopCamera}
                className="bg-red-500 text-white px-5 py-2 rounded-md flex items-center gap-2"
                disabled={state.isAnalyzing}
              >
                <FontAwesomeIcon icon={faStop} className="text-white" />
                <span>Stop</span>
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Photo gallery */}
      <div className="w-full md:w-96">
        <div className="rounded-lg p-4 border bg-darkgreen/10">
          <div className="flex justify-between items-center text-lg font-medium font-semibold text-darkgreen mb-4">
            <p>Captured Photos ({state.photos.length})</p>
            <Button
              onPress={handleReset}
              className="bg-red-500 text-white rounded-lg"
            >
              <FontAwesomeIcon icon={faTrash} className="text-white text-lg" />
            </Button>
          </div>
          
          <div className="rounded-lg h-80 mb-4">
            {state.photos.length === 0 ? (
              <div className="flex flex-col h-80 text-center p-4 justify-center items-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                    <FontAwesomeIcon icon={faImage} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 italic">
                    No photos captured yet
                  </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 h-80 overflow-y-auto">
                  {state.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative h-32 bg-white rounded-lg overflow-hidden shadow-sm group"
                    >
                      <img
                        src={photo}
                        alt={`Captured item ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <span className="absolute bottom-0 right-0 bg-black/70 text-white text-xs py-1 px-2 rounded-tl-md">
                        #{index + 1}
                      </span>
                      <button 
                        onClick={() => deletePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Delete photo ${index + 1}`}
                      >
                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              </> 
          )}
          </div>
            <Button
              onPress={submitPhotos}
              className="w-full bg-darkgreen text-white py-2 px-4 rounded-lg"
              disabled={state.photos.length === 0 || state.isAnalyzing}
            >
              {state.isAnalyzing ? 'Analyzing...' : 'Analyze Photos'}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default Camera; 