import React, { useState } from 'react';
import { Button } from "@heroui/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { config } from '@/config';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import NoScrollLink from '@/app/(components)/NoScrollLink';
import { motion } from 'framer-motion';

interface CalendarImportProps {
  calendarLink: string;
}

const CalendarImport: React.FC<CalendarImportProps> = ({
  calendarLink
}) => {
  const [isTemporarilyDisabled, setIsTemporarilyDisabled] = useState(false);
  const router = useRouter();
  const downloadCalendar = async () => {
    if (calendarLink) {
      try {
        const response = await fetch(`${config.apiUrl}${calendarLink}.ics`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'best-before-reminders.ics';
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        
        // Disable button temporarily
        setIsTemporarilyDisabled(true);
        setTimeout(() => {
          setIsTemporarilyDisabled(false);
        }, 10000); // 1 minutes
      } catch (error) {
        console.error('Error downloading calendar:', error);
      }
    }
  };

  return (
    <div>
        <div className="flex flex-col grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-5">
            <div className="bg-green/10 rounded-lg p-5 mb-8">
                {/* Success message */}
                <h3 className="text-xl font-medium text-darkgreen mb-4 font-semibold">
                    Download your Reminders File
                </h3>
                <p className="text-white-600">
                    Click the button to download a personalized <span className="font-semibold text-green">calendar file (.ics)</span> that you can import into your digital calendar like <span className="font-semibold text-green">Google Calendar</span>, <span className="font-semibold text-green">Apple Calendar</span>, or <span className="font-semibold text-green">Outlook</span>.
                </p>
                {/* Download calendar file */}
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
            {/* Import instructions */}
            <div className="mb-8 p-5">
                <h3 className="text-lg font-semibold text-teal-700 mb-3">
                    How to import your calendar:
                </h3>
                <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                    <li>
                    Download the calendar file (.ics)
                    </li>
                    <li>
                    Open your preferred calendar app
                    </li>
                    <li>Look for an "Import" or "Add Calendar" option</li>
                    <li>Select the downloaded file and confirm the import</li>
                </ol>
            </div>
        </div>
        {/* Coming up next section */}
        <div className="bg-amber-50 rounded-lg p-6">
            <div className="flex justify-center items-center">
                <div className="flex flex-col items-center w-2/3">
                    <h3 className="text-lg font-semibold text-amber-900 mb-2">
                        Coming Up Next:
                    </h3>
                    <p className="text-amber-700 mb-4">
                        Generate smart grocery lists that skip what you
                        already have in storage.
                    </p>
                    <NoScrollLink href="/eco-grocery">
                        <div
                            className="bg-amber-600 text-white py-2 px-8 rounded-lg cursor-pointer hover:bg-amber-700 transition-colors duration-300"
                        >
                            <p className="font-semibold text-white">Continue to Meal Planning</p>
                        </div>
                    </NoScrollLink>
                </div>
                <div className="flex justify-center items-center w-1/3">
                    <Image src="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/calendar_import.png" alt="Calendar Import" width={400} height={400} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default CalendarImport;