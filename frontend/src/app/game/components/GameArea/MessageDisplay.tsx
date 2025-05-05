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
      className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg font-bold ${
        messageType === 'success' 
          ? 'bg-green-200 text-green-900' 
          : 'bg-red-200 text-red-900'
      }`}
    >
      {message}
    </div>
  );
} 