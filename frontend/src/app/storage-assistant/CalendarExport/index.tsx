import React, { useState } from 'react';
import { Button, Select, SelectItem } from "@heroui/react";
import { CalendarSelection, ProduceDetections } from '../interfaces';

interface CalendarExportProps {
  calendarSelection: CalendarSelection;
  setCalendarSelection: React.Dispatch<React.SetStateAction<CalendarSelection>>;
  detections: ProduceDetections | null;
  generateCalendarLink: () => Promise<void>;
}

const CalendarExport: React.FC<CalendarExportProps> = ({
  calendarSelection,
  setCalendarSelection,
  detections,
  generateCalendarLink
}) => {
  const [isTemporarilyDisabled, setIsTemporarilyDisabled] = useState(false);

  // Copy calendar link to clipboard
  const downloadCalendar = () => {
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
      }, 30000); // 30 seconds
    }
  };

  const onSelectAll = () => {
    if (!detections?.produce_counts) return;
    
    const allItems = Object.entries(detections.produce_counts).map(([item, count]) => ({
      name: item,
      quantity: count,
      expiry_date: 7, // Default to 7 days
      reminder_days: calendarSelection.reminderDays,
      reminder_time: calendarSelection.reminderTime
    }));

    setCalendarSelection(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.length === Object.keys(detections.produce_counts).length 
        ? [] // If all items are selected, deselect all
        : allItems // Otherwise, select all items
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
      <div className = "grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-medium text-darkgreen mb-4">
              Select Items for Reminders
            </h3>
            <Button
              onPress={onSelectAll}
              className="mb-4 py-2 px-8 bg-amber-500 rounded-lg text-white font-medium"
            >
              {detections?.produce_counts && 
              calendarSelection.selectedItems.length === Object.keys(detections.produce_counts).length 
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
          {detections?.produce_counts ? (
            <div className="bg-white/70 rounded-lg p-4 h-[240px] overflow-y-auto">
              <ul className="space-y-2">
                {Object.entries(detections.produce_counts).map(([item, count]) => (
                  <li key={item} className="py-2 border-b border-gray-100 last:border-0">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={calendarSelection.selectedItems.some(i => i.name === item)}
                        onChange={() => {
                          // Find the storage time for this item
                          const storageTime = 7; // Default to 7 days if not found
                          setCalendarSelection(prev => {
                            const existingIndex = prev.selectedItems.findIndex(i => i.name === item);
                            
                            if (existingIndex >= 0) {
                              const newSelectedItems = [...prev.selectedItems];
                              newSelectedItems.splice(existingIndex, 1);
                              return { ...prev, selectedItems: newSelectedItems };
                            } else {
                              const newItem = {
                                name: item,
                                quantity: count,
                                expiry_date: storageTime,
                                reminder_days: prev.reminderDays,
                                reminder_time: prev.reminderTime
                              };
                              return { ...prev, selectedItems: [...prev.selectedItems, newItem] };
                            }
                          });
                        }}
                        className="mr-2"
                      />
                      <div className="flex  w-full items-center p-3 rounded-lg bg-lightgreen/20">
                        <span className="flex-grow">{item}</span>
                        <span className="text-gray-600">Qty: {count}</span>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 min-h-40 flex items-center justify-center">
              <p className="text-gray-500 italic">
                Take and submit photos to see items
              </p>
            </div>
          )}
        </div>
        
        {/* Calendar Link */}
        <div className="flex flex-col justify-center items-center">
          <div>
          <p className="text-black text-sm">
            Click the button to download a personalized calendar file (.ics) that you can import into your digital calendar like <span className="text-green">Google Calendar, Apple Calendar, or Outlook</span>.
          </p>
          <div className="mt-6">
            <button
              onClick={async () => {
                await generateCalendarLink();
                downloadCalendar();
              }}
              disabled={!detections || calendarSelection.selectedItems.length === 0 || isTemporarilyDisabled}
              className={`w-full py-4 rounded-md text-white font-medium ${
                !detections || calendarSelection.selectedItems.length === 0 || isTemporarilyDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600 transition"
              }`}
            >
              {isTemporarilyDisabled ? "✓ Calendar file downloaded!" : "Download Calendar File"}
            </button>
          </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarExport; 