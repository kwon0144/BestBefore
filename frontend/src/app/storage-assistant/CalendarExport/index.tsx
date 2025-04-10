import React from 'react';
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
  // Copy calendar link to clipboard
  const copyCalendarLink = () => {
    if (calendarSelection.calendarLink) {
      navigator.clipboard.writeText(calendarSelection.calendarLink);
      alert('Calendar link copied to clipboard!');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Calendar Export
      </h2>
      <div className="bg-gray-50 rounded-lg p-5 mb-6">
        <h3 className="text-xl font-medium text-gray-700 mb-4">
          Reminder Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="days-before"
              className="block text-gray-700 mb-2"
            >
              Days before expiry:
            </label>
            <div className="relative">
              <select
                id="days-before"
                className="w-full p-3 bg-white border border-gray-300 rounded-md appearance-none pr-10"
                value={calendarSelection.reminderDays}
                onChange={(e) => setCalendarSelection(prev => ({
                  ...prev,
                  reminderDays: parseInt(e.target.value)
                }))}
              >
                {[1, 2, 3, 4, 5, 6, 7].map(days => (
                  <option key={days} value={days}>{days} day{days !== 1 ? 's' : ''} before</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label
              htmlFor="reminder-time"
              className="block text-gray-700 mb-2"
            >
              Reminder time:
            </label>
            <div className="relative">
              <input
                type="time"
                id="reminder-time"
                className="w-full p-3 bg-white border border-gray-300 rounded-md"
                value={calendarSelection.reminderTime}
                onChange={(e) => setCalendarSelection(prev => ({
                  ...prev,
                  reminderTime: e.target.value
                }))}
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Item Selection */}
        <div>
          <h3 className="text-xl font-medium text-gray-700 mb-4">
            Select Items for Reminders
          </h3>
          {detections?.produce_counts ? (
            <div className="bg-white rounded-lg p-4 min-h-40 max-h-80 overflow-y-auto">
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
                      <span className="text-gray-800">
                        {item} (Qty: {count})
                      </span>
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
        <div>
          <h3 className="text-xl font-medium text-gray-700 mb-4">
            Your Calendar Link
          </h3>
          {calendarSelection.calendarLink ? (
            <div className="bg-white rounded-lg p-4 min-h-40">
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={calendarSelection.calendarLink}
                  readOnly
                  className="flex-1 p-3 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={copyCalendarLink}
                  className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors min-w-20"
                >
                  Copy
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 min-h-40 flex items-center justify-center">
              <p className="text-gray-500 italic">
                {calendarSelection.selectedItems.length > 0
                  ? 'Click "Generate Calendar Link"'
                  : 'Select items first'}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={generateCalendarLink}
          disabled={!detections || calendarSelection.selectedItems.length === 0}
          className={`w-full py-4 rounded-md text-white font-medium ${
            !detections || calendarSelection.selectedItems.length === 0
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-amber-500 hover:bg-amber-600 transition"
          }`}
        >
          Generate Calendar Link
        </button>
      </div>
    </div>
  );
};

export default CalendarExport; 