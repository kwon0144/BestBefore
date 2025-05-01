/**
 * CalendarImport Component
 * 
 * This component provides functionality to download and import calendar events into various calendar applications.
 * It generates a downloadable .ics file containing reminders that can be imported into popular calendar apps
 * like Google Calendar, Apple Calendar, or Outlook.
 */

import React, { useState } from 'react';
import { Button } from "@heroui/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { config } from '@/config';

/**
 * Props interface for the CalendarImport component
 * @property {string} calendarLink - The API endpoint URL for downloading the calendar file
 */
interface CalendarImportProps {
  calendarLink: string;
}

/**
 * CalendarImport Component
 * 
 * @param {CalendarImportProps} props - Component props containing the calendar download link
 * @returns {JSX.Element} A React component for downloading and importing calendar events
 */
const CalendarImport: React.FC<CalendarImportProps> = ({
  calendarLink
}) => {
  // State to manage button disable status after download
  const [isTemporarilyDisabled, setIsTemporarilyDisabled] = useState(false);

  /**
   * Handles the calendar file download process
   * - Fetches the calendar file from the API
   * - Creates a downloadable blob
   * - Triggers the download
   * - Temporarily disables the download button to prevent multiple downloads
   */
  const downloadCalendar = async () => {
    if (calendarLink) {
      try {
        // Fetch the calendar file from the API
        const response = await fetch(`${config.apiUrl}${calendarLink}`);
        const blob = await response.blob();
        
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create and configure the download link
        const link = document.createElement('a');
        link.href = url;
        link.download = 'best-before-reminders.ics';
        
        // Trigger the download
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        
        // Disable button temporarily to prevent multiple downloads
        setIsTemporarilyDisabled(true);
        setTimeout(() => {
          setIsTemporarilyDisabled(false);
        }, 10000); // 10 seconds cooldown
      } catch (error) {
        console.error('Error downloading calendar:', error);
      }
    }
  };

  return (
    <div>
        <div className="flex flex-col grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-5">
            {/* Download Section */}
            <div className="bg-green/10 rounded-lg p-5 mb-8">
                <h3 className="text-xl font-medium text-darkgreen mb-4 font-semibold">
                    Download your Reminders File
                </h3>
                <p className="text-white-600">
                    Click the button to download a personalized <span className="font-semibold text-green">calendar file (.ics)</span> that you can import into your digital calendar like <span className="font-semibold text-green">Google Calendar</span>, <span className="font-semibold text-green">Apple Calendar</span>, or <span className="font-semibold text-green">Outlook</span>.
                </p>
                {/* Download Button */}
                <div className="mt-4">
                    <Button
                        onPress={downloadCalendar}
                        className={`bg-darkgreen text-white py-2 px-8 rounded-lg ${
                            isTemporarilyDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        isDisabled={isTemporarilyDisabled}
                        >
                        <FontAwesomeIcon icon={faDownload} className="text-white mr-2" />
                        <p className="font-semibold text-white">Download Calendar File</p>
                    </Button>
                </div>
            </div>
            
            {/* Import Instructions Section */}
            <div className="mb-8 p-5">
                <h3 className="text-xl font-medium text-darkgreen mb-4 font-semibold">
                    How to import your calendar:
                </h3>
                <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                    <li>
                    Download the calendar file (.ics)
                    </li>
                    <li>
                    Open your preferred calendar app
                    </li>
                    <li>Look for an &quot;Import&quot; or &quot;Add Calendar&quot; option</li>
                    <li>Select the downloaded file and confirm the import</li>
                </ol>
            </div>
        </div>
    </div>
  );
};

export default CalendarImport;