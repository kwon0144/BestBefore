/**
 * FullscreenButton Component
 * Provides a button to toggle fullscreen mode in the game
 * 
 * Features:
 * - Button in the bottom-right corner to toggle fullscreen
 * - Supports F key as keyboard shortcut for fullscreen toggle
 * - Visual indicators for current fullscreen state
 */
import React, { useState, useEffect, useCallback } from 'react';

interface FullscreenButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
}

export default function FullscreenButton({ targetRef }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update fullscreen state when it changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Toggle fullscreen mode - wrapped in useCallback to prevent unnecessary rerenders
  const toggleFullscreen = useCallback(() => {
    if (!targetRef.current) return;

    if (!document.fullscreenElement) {
      // Enter fullscreen
      targetRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      // Exit fullscreen
      document.exitFullscreen().catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  }, [targetRef]);

  // Add keyboard shortcut (F key) for fullscreen toggle
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Toggle fullscreen when F key is pressed
      if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [toggleFullscreen]);

  return (
    <button
      onClick={toggleFullscreen}
      className="absolute bottom-4 right-4 bg-green-700 hover:bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-10 transition-transform duration-200 hover:scale-110"
      title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
    >
      {isFullscreen ? (
        // Exit fullscreen icon
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
          <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
          <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
          <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
        </svg>
      ) : (
        // Enter fullscreen icon
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8V5a2 2 0 0 1 2-2h3"></path>
          <path d="M16 3h3a2 2 0 0 1 2 2v3"></path>
          <path d="M21 16v3a2 2 0 0 1-2 2h-3"></path>
          <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
        </svg>
      )}
    </button>
  );
} 