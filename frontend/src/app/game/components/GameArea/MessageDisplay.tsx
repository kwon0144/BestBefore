/**
 * MessageDisplay Component
 * Displays game messages and notifications
 */
import React from 'react';
import { MessageType } from '../../interfaces';

interface MessageDisplayProps {
  message: string;
  messageType: MessageType;
}

/**
 * Displays feedback messages during gameplay
 */
export default function MessageDisplay({ message, messageType }: MessageDisplayProps) {
  if (!message) return null;
  
  return (
    <div
      className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg font-bold shadow-md ${
        messageType === 'success' 
          ? 'bg-green-300 text-green-900 border-2 border-green-600' 
          : 'bg-red-300 text-red-900 border-2 border-red-600'
      }`}
      style={{
        opacity: 1,
        backgroundColor: messageType === 'success' ? 'rgba(167, 243, 208, 1)' : 'rgba(254, 202, 202, 1)'
      }}
    >
      {message}
    </div>
  );
} 