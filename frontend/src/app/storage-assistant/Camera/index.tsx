import React, { useRef } from 'react';
import { CameraState } from './interfaces';

interface CameraProps {
  state: CameraState;
  setState: React.Dispatch<React.SetStateAction<CameraState>>;
}

const Camera: React.FC<CameraProps> = ({ state, setState }) => {
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
        stream: null,
        photos: [], // Clear all photos when stopping camera
        detections: null
      }));
    }
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
      </div>
    </div>
  );
};

export default Camera; 