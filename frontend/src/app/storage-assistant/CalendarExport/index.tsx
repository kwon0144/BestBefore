/* CalendarExport Component
 * 
 * This component manages the export of food items to calendar reminders.
 * It allows users to set reminder preferences and select items from fridge and pantry
 * for tracking expiry dates and receiving notifications.
 */
import React, { useCallback } from 'react';
import { Button, Select, SelectItem } from "@heroui/react";
import { CalendarSelection, ProduceDetections, StorageAdviceResponse, StorageRecommendation } from '../interfaces';
import axios from 'axios';
import { config } from '@/config';

/**
 * Props interface for the CalendarExport component
 * @interface CalendarExportProps
 * @property {CalendarSelection} calendarSelection - Current calendar selection state
 * @property {React.Dispatch<React.SetStateAction<CalendarSelection>>} setCalendarSelection - Function to update calendar selection
 * @property {ProduceDetections | null} detections - Detected produce items or null if none
 * @property {StorageRecommendation} storageRecs - Storage recommendations for items
 */
interface CalendarExportProps {
  calendarSelection: CalendarSelection;
  setCalendarSelection: React.Dispatch<React.SetStateAction<CalendarSelection>>;
  detections: ProduceDetections | null;
  storageRecs: StorageRecommendation;
}

/**
 * CalendarExport Component
 *
 * @param {CalendarExportProps} props - Component props containing the calendar selection state, update function, detections, and storage recommendations
 * @returns {JSX.Element} A React component for setting reminder preferences and selecting items for calendar reminders
 */
const CalendarExport: React.FC<CalendarExportProps> = ({
  calendarSelection,
  setCalendarSelection,
  detections,
  storageRecs,
}) => {
  /**
   * Maps storage items to calendar items format
   * @param {Object.<string, number>} items - Object containing item names and their quantities
   * @returns {CalendarItem[]} Array of calendar items with proper formatting
   */
  const mapStorageToCalendarItems = (items: { [key: string]: number }) => {
    return Object.entries(items).map(([item, count]: [string, number]) => {
      const storageTimeMatch = item.match(/\((\d+) days\)/);
      const storageTime = storageTimeMatch ? parseInt(storageTimeMatch[1]) : 7;
      const cleanItemName = item.split(' (')[0];
      return {
        name: cleanItemName,
        quantity: count,
        expiry_date: storageTime,
        reminder_days: calendarSelection.reminderDays,
        reminder_time: calendarSelection.reminderTime
      };
    });
  };

  /**
   * Retrieves fridge items from storage recommendations
   * @returns {Object.<string, number>} Object containing fridge item names and their quantities
   */
  const getFridgeItems = () => {
    const items: { [key: string]: number } = {};
    storageRecs.fridge.forEach(item => {
      items[item.name] = item.quantity;
    });
    return items;
  };

  /**
   * Retrieves pantry items from storage recommendations
   * @returns {Object.<string, number>} Object containing pantry item names and their quantities
   */
  const getPantryItems = () => {
    const items: { [key: string]: number } = {};
    storageRecs.pantry.forEach(item => {
      items[item.name] = item.quantity;
    });
    return items;
  };

  /**
   * Fetches storage time for a specific food type from the API
   * @param {string} foodType - The type of food to get storage time for
   * @returns {Promise<number>} Promise resolving to the storage time in days
   */
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

  /**
   * Fetches storage times for all detected items
   * @returns {Promise<void>} Promise that resolves when all storage times are fetched
   */
  const fetchStorageTimes = useCallback(async () => {
    if (!detections?.produce_counts) return;

    for (const [item] of Object.entries(detections.produce_counts)) {
      await getStorageTime(item);
    }
  }, [detections?.produce_counts]);

  // Fetch storage times when detections change
  React.useEffect(() => {
    if (detections?.produce_counts) {
      fetchStorageTimes();
    }
  }, [detections?.produce_counts, fetchStorageTimes]);

  /**
   * Handles item selection/deselection for calendar reminders
   * @param {string} item - The item name with storage time
   * @param {number} count - The quantity of the item
   */
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
    {/* Reminder Settings */}
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
    <div className="mt-10">    
      <h3 className="text-xl font-medium text-darkgreen mb-4">
        Select Items for Reminders
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Fridge Items */}
        <div className="bg-white/70 rounded-lg p-5 min-h-[360px]">
          <div className="flex justify-between items-center border-b-2 border-blue-500 pb-2">
            <h3 className="text-xl font-semibold text-blue-600">
              Refrigerator
            </h3>
            <Button
              onPress={() => {
                const fridgeItems = getFridgeItems();
                const items = mapStorageToCalendarItems(fridgeItems);

                const fridgeItemNames = Object.keys(fridgeItems).map(item => item.split(' (')[0]);
                const nonFridgeItems = calendarSelection.selectedItems.filter(
                  item => !fridgeItemNames.includes(item.name)
                );

                setCalendarSelection(prev => ({
                  ...prev,
                  selectedItems: Object.entries(getFridgeItems()).every(([item]) => 
                    prev.selectedItems.some(i => i.name === item.split(' (')[0])
                  )
                    ? nonFridgeItems
                    : [...nonFridgeItems, ...items]
                }));
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              {/* Check if all fridge items are selected */}
              {calendarSelection.selectedItems.length > 0 && Object.entries(getFridgeItems()).every(([item]) => 
                calendarSelection.selectedItems.some(i => i.name === item.split(' (')[0])
              )
                ? "Deselect All" 
                : "Select All"}
            </Button>
          </div>
          {/* Fridge Item List */}
          <div>
          {Object.keys(getFridgeItems()).length > 0 ? (
            <div className="p-4 h-[240px] overflow-y-auto">
              <ul className="space-y-2">
                {Object.entries(getFridgeItems()).map(([item, count]) => (
                  <li key={item} className="py-2 border-b last:border-0">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={calendarSelection.selectedItems.some(i => i.name === item.split(' (')[0])}
                        onChange={() => handleItemSelection(item, count)}
                        className="mr-2"
                      />
                      <div className="grid grid-cols-3 w-full items-center p-3 rounded-lg bg-blue-50">
                        <div className="text-left">{item.split(' (')[0]}</div>
                        <div className="text-center text-gray-600">Qty: {count}</div>
                        <div className="text-right text-gray-600">Storage: {item.match(/\((\d+) days\)/)?.[1] || '...'} days</div>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[240px]">
              <p className="text-gray-500 text-center">No Refrigerator item <br/> Please add items in the previous step</p>
            </div>
          )}
          </div>    
        </div>

        {/* Pantry Items */}
        <div className="bg-white/70 rounded-lg p-5 min-h-[360px]">
          <div className="flex justify-between items-center border-b-2 border-amber-700 pb-2">
            <h3 className="text-xl font-semibold text-amber-700">
              Pantry
            </h3>
            <Button
              onPress={() => {
                const pantryItems = getPantryItems();
                const items = mapStorageToCalendarItems(pantryItems);

                const pantryItemNames = Object.keys(pantryItems).map(item => item.split(' (')[0]);
                const nonPantryItems = calendarSelection.selectedItems.filter(
                  item => !pantryItemNames.includes(item.name)
                );

                setCalendarSelection(prev => ({
                  ...prev,
                  selectedItems: Object.entries(getPantryItems()).every(([item]) => 
                    prev.selectedItems.some(i => i.name === item.split(' (')[0])
                  )
                    ? nonPantryItems
                    : [...nonPantryItems, ...items]
                }));
              }}
              className="bg-amber-700 text-white px-4 py-2 rounded-lg"
            >
              {/* Check if all pantry items are selected */}
              {calendarSelection.selectedItems.length > 0 && Object.entries(getPantryItems()).every(([item]) => 
                calendarSelection.selectedItems.some(i => i.name === item.split(' (')[0])
              )
                ? "Deselect All" 
                : "Select All"}
            </Button>
          </div>
          {/* Pantry Item List */}
          <div>
          {Object.keys(getPantryItems()).length > 0 ? (
            <div className="bg-white rounded-lg p-4 h-[240px] overflow-y-auto">
              <ul className="space-y-2">
                {Object.entries(getPantryItems()).map(([item, count]) => (
                  <li key={item} className="py-2 border-b border-gray-100 last:border-0">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={calendarSelection.selectedItems.some(i => i.name === item.split(' (')[0])}
                        onChange={() => handleItemSelection(item, count)}
                        className="mr-2"
                      />
                      <div className="grid grid-cols-3 w-full items-center p-3 rounded-lg bg-amber-50">
                        <div className="text-left">{item.split(' (')[0]}</div>
                        <div className="text-center text-gray-600">Qty: {count}</div>
                        <div className="text-right text-gray-600">Storage: {item.match(/\((\d+) days\)/)?.[1] || '...'} days</div>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[240px]">
              <p className="text-gray-500 text-center">No Pantry item <br/> Please add items in the previous step</p>
            </div>
          )}
          </div>    
        </div>
      </div>
    </div>
    </>
  );
};

export default CalendarExport; 