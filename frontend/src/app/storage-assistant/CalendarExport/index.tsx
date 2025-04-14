import React, { useState } from 'react';
import { Button, Select, SelectItem } from "@heroui/react";
import { CalendarSelection, ProduceDetections, StorageAdviceResponse, StorageRecommendation } from '../interfaces';
import axios from 'axios';
import { config } from '@/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

interface CalendarExportProps {
  calendarSelection: CalendarSelection;
  setCalendarSelection: React.Dispatch<React.SetStateAction<CalendarSelection>>;
  detections: ProduceDetections | null;
  generateCalendarLink: (calendarItems: { name: string; quantity: number; expiry_date: number; reminder_days: number; reminder_time: string }[]) => Promise<void>;
  storageRecs: StorageRecommendation;
}

const CalendarExport: React.FC<CalendarExportProps> = ({
  calendarSelection,
  setCalendarSelection,
  detections,
  generateCalendarLink,
  storageRecs
}) => {
  const [isTemporarilyDisabled, setIsTemporarilyDisabled] = useState(false);
  const [storageTimes, setStorageTimes] = useState<{ [key: string]: number }>({});
  const steps = ['Select Items', 'Set Reminders', 'Download Calendar'];
  const [activeStep, setActiveStep] = useState(0);
  const [selectedItems, setSelectedItems] = useState<{ name: string; quantity: number }[]>([]);

  // Get all items from storage recommendations
  const getAllItems = () => {
    const items: { [key: string]: number } = {};
    [...storageRecs.fridge, ...storageRecs.pantry].forEach(item => {
      const cleanName = item.name.split(' (')[0];
      items[item.name] = item.quantity;
    });
    return items;
  };

  // Get storage time for a food type
  const getStorageTime = async (foodType: string) => {
    try {
      const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
        food_type: foodType
      });
      return response.data.storage_time;
    } catch (error) {
      console.error(`Error getting storage time for ${foodType}:`, error);
      return 7; // Default to 7 days if there's an error
    }
  };

  // Get storage times for all detected items
  const fetchStorageTimes = async () => {
    if (!detections?.produce_counts) return;

    const newStorageTimes: { [key: string]: number } = {};
    for (const [item] of Object.entries(detections.produce_counts)) {
      const storageTime = await getStorageTime(item);
      newStorageTimes[item] = storageTime;
    }
    setStorageTimes(newStorageTimes);
  };

  // Fetch storage times when detections change
  React.useEffect(() => {
    if (detections?.produce_counts) {
      fetchStorageTimes();
    }
  }, [detections]);

  // Copy calendar link to clipboard
  const downloadCalendar = () => {
    if (calendarSelection.selectedItems.length === 0) {
      alert("Please select at least one item!");
      return;
    }
    
    if (calendarSelection.calendarLink) {
      // Create an anchor element
      const link = document.createElement('a');
      link.href = calendarSelection.calendarLink;
      link.download = 'best-before-reminders.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Disable button temporarily
      setIsTemporarilyDisabled(true);
      setTimeout(() => {
        setIsTemporarilyDisabled(false);
      }, 3000); // 3 seconds
    }
  };

  // Update the item selection handler
  const handleItemSelection = (item: string, count: number) => {
    // Extract storage time from the item name if it exists
    const storageTimeMatch = item.match(/\((\d+) days\)/);
    const storageTime = storageTimeMatch ? parseInt(storageTimeMatch[1]) : 7;
    const cleanItemName = item.split(' (')[0]; // Remove the storage time part if it exists

    setCalendarSelection(prev => {
      const existingIndex = prev.selectedItems.findIndex(i => i.name === cleanItemName);
      
      if (existingIndex >= 0) {
        const newSelectedItems = [...prev.selectedItems];
        newSelectedItems.splice(existingIndex, 1);
        return { ...prev, selectedItems: newSelectedItems };
      } else {
        const newItem = {
          name: cleanItemName,
          quantity: count,
          expiry_date: storageTime,
          reminder_days: prev.reminderDays,
          reminder_time: prev.reminderTime
        };
        return { ...prev, selectedItems: [...prev.selectedItems, newItem] };
      }
    });
  };

  const onSelectAll = () => {
    const allItems = getAllItems();
    
    const items = Object.entries(allItems).map(([item, count]) => {
      // Extract storage time from the item name if it exists in the format "name (X days)"
      const storageTimeMatch = item.match(/\((\d+) days\)/);
      const storageTime = storageTimeMatch ? parseInt(storageTimeMatch[1]) : 7;
      
      return {
        name: item.split(' (')[0], // Remove the storage time part if it exists
        quantity: count,
        expiry_date: storageTime,
        reminder_days: calendarSelection.reminderDays,
        reminder_time: calendarSelection.reminderTime
      };
    });

    setCalendarSelection(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.length === Object.keys(allItems).length 
        ? [] // If all items are selected, deselect all
        : items // Otherwise, select all items
    }));
  };

  // Days before expiry
  const daysBeforeExpiry = [
    {key: "1", label: "1 day before"},
    {key: "2", label: "2 days before"},
    {key: "3", label: "3 days before"},
    {key: "4", label: "4 days before"},
    {key: "5", label: "5 days before"},
    {key: "6", label: "6 days before"},
    {key: "7", label: "7 days before"}
  ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Generate calendar items from selected items
      const calendarItems = selectedItems.map(item => {
        // Extract storage time from the item name (format: "name (X days)")
        const storageTimeMatch = item.name.match(/\((\d+) days\)/);
        const storageTime = storageTimeMatch ? parseInt(storageTimeMatch[1]) : 7;
        
        return {
          name: item.name.split(' (')[0], // Remove the storage time part
          quantity: item.quantity,
          expiry_date: storageTime,
          reminder_days: 2,
          reminder_time: "09:00"
        };
      });

      // Generate calendar
      generateCalendarLink(calendarItems);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  return (
    <>
      <div className="bg-green/10 rounded-lg p-5 mb-6">
        <h3 className="text-xl font-medium text-darkgreen mb-4">
          Reminder Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Select
              classNames={{trigger: "bg-white min-h-[50px]"}}
              defaultSelectedKeys={[calendarSelection.reminderDays.toString()]}
              label="Number of days before expiry"
              labelPlacement="outside"
              placeholder="Select days"
              scrollShadowProps={{
                isEnabled: false,
              }}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string;
                setCalendarSelection(prev => ({
                  ...prev,
                  reminderDays: parseInt(selectedKey)
                }));
              }}
            >
              {daysBeforeExpiry.map((days) => (
                <SelectItem key={days.key}>{days.label}</SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <label
              htmlFor="reminder-time"
              className="block text-sm text-black mb-0.5"
            >
              Reminder time
            </label>
            <div className="relative">
              <input
                type="time"
                id="reminder-time"
                className="w-full min-h-[50px] bg-white rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 border border-gray-200"
                value={calendarSelection.reminderTime}
                onChange={(e) => setCalendarSelection(prev => ({
                  ...prev,
                  reminderTime: e.target.value
                }))}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-medium text-darkgreen mb-4">
            Select Items for Reminders
          </h3>
          <Button
            onPress={onSelectAll}
            className="mb-4 py-2 px-8 bg-amber-500 rounded-lg text-white font-medium"
          >
            {calendarSelection.selectedItems.length === Object.keys(getAllItems()).length 
              ? "Deselect All" 
              : "Select All"}
          </Button>
        </div>
        <div>
          <h3 className="text-xl font-medium text-darkgreen mb-4">
              Generate Calendar
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Item Selection */}
        <div>
          {Object.keys(getAllItems()).length > 0 ? (
            <div className="bg-white/70 rounded-lg p-4 h-[240px] overflow-y-auto">
              <ul className="space-y-2">
                {Object.entries(getAllItems()).map(([item, count]) => (
                  <li key={item} className="py-2 border-b border-gray-100 last:border-0">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={calendarSelection.selectedItems.some(i => i.name === item.split(' (')[0])}
                        onChange={() => handleItemSelection(item, count)}
                        className="mr-2"
                      />
                      <div className="flex w-full items-center p-3 rounded-lg bg-lightgreen/20">
                        <span className="flex-grow">{item}</span>
                        <span className="text-gray-600">Qty: {count}</span>
                        <span className="text-gray-600 ml-2">Storage: {item.match(/\((\d+) days\)/)?.[1] || '...'} days</span>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 min-h-40 flex items-center justify-center">
              <p className="text-gray-500 italic">
                No items available
              </p>
            </div>
          )}
        </div>
        
        {/* Calendar Link */}
        <div>
          <p className="text-black text-sm">
            Click the button to download a personalized calendar file (.ics) that you can import into your digital calendar like <span className="text-green">Google Calendar, Apple Calendar, or Outlook</span>.
          </p>
          <div className="mt-6">
            <Button
              onPress={async () => {
                if (calendarSelection.selectedItems.length === 0) {
                  alert("Please select at least one item!");
                  return;
                }
                await generateCalendarLink(calendarSelection.selectedItems);
                downloadCalendar();
              }}
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
      </div>
    </>
  );
};

export default CalendarExport; 