/* CalendarExport Component
 * 
 * This component manages the export of food items to calendar reminders.
 * It allows users to set reminder preferences and select items from fridge and pantry
 * for tracking expiry dates and receiving notifications.
 */
import React from 'react';
import { Button, Select, SelectItem } from "@heroui/react";
import { CalendarSelection } from '../interfaces';
import useInventoryStore from '@/store/useInventoryStore';

/**
 * Props interface for the CalendarExport component
 * @interface CalendarExportProps
 * @property {CalendarSelection} calendarSelection - Current calendar selection state
 * @property {React.Dispatch<React.SetStateAction<CalendarSelection>>} setCalendarSelection - Function to update calendar selection
 */
interface CalendarExportProps {
  calendarSelection: CalendarSelection;
  setCalendarSelection: React.Dispatch<React.SetStateAction<CalendarSelection>>;
}

/**
 * CalendarExport Component
 *
 * @param {CalendarExportProps} props - Component props containing the calendar selection state and update function
 * @returns {JSX.Element} A React component for setting reminder preferences and selecting items for calendar reminders
 */
const CalendarExport: React.FC<CalendarExportProps> = ({
  calendarSelection,
  setCalendarSelection,
}) => {
  // Get items from Zustand store
  const { getItemsByLocation } = useInventoryStore();

  /**
   * Maps inventory items to calendar items format
   * @param {Array<{name: string; quantity: string; daysLeft?: number}>} items - Array of inventory items
   * @returns {CalendarItem[]} Array of calendar items with proper formatting
   */
  const mapInventoryToCalendarItems = (items: Array<{name: string; quantity: string; daysLeft?: number}>) => {
    return items.map(item => {
      const quantity = parseInt(item.quantity.split(' ')[0]) || 1;
      const daysLeft = item.daysLeft || 7; // Default to 7 days if undefined
      return {
        name: item.name,
        quantity: quantity,
        expiry_date: daysLeft,
        reminder_days: calendarSelection.reminderDays,
        reminder_time: calendarSelection.reminderTime
      };
    });
  };

  /**
   * Retrieves fridge items from inventory store
   * @returns {Array<{name: string; quantity: string; daysLeft: number}>} Array of fridge items
   */
  const getFridgeItems = () => {
    return getItemsByLocation('refrigerator');
  };

  /**
   * Retrieves pantry items from inventory store
   * @returns {Array<{name: string; quantity: string; daysLeft: number}>} Array of pantry items
   */
  const getPantryItems = () => {
    return getItemsByLocation('pantry');
  };

  /**
   * Handles item selection/deselection for calendar reminders
   * @param {string} itemName - The item name
   * @param {number} quantity - The quantity of the item
   * @param {number} daysLeft - Days until expiry
   */
  const handleItemSelection = (itemName: string, quantity: number, daysLeft: number | undefined) => {
    setCalendarSelection(prev => {
      const existingIndex = prev.selectedItems.findIndex(i => i.name === itemName);
      
      if (existingIndex >= 0) {
        const newSelectedItems = [...prev.selectedItems];
        newSelectedItems.splice(existingIndex, 1);
        return { ...prev, selectedItems: newSelectedItems };
      } else {
        const newItem = {
          name: itemName,
          quantity: quantity,
          expiry_date: daysLeft || 7, // Default to 7 days if undefined
          reminder_days: prev.reminderDays,
          reminder_time: prev.reminderTime
        };
        return { ...prev, selectedItems: [...prev.selectedItems, newItem] };
      }
    });
  };

  // Days before expiry options
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
                const items = mapInventoryToCalendarItems(fridgeItems);

                const fridgeItemNames = fridgeItems.map(item => item.name);
                const nonFridgeItems = calendarSelection.selectedItems.filter(
                  item => !fridgeItemNames.includes(item.name)
                );

                setCalendarSelection(prev => ({
                  ...prev,
                  selectedItems: fridgeItems.every(item => 
                    prev.selectedItems.some(i => i.name === item.name)
                  )
                    ? nonFridgeItems
                    : [...nonFridgeItems, ...items]
                }));
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              {/* Check if all fridge items are selected */}
              {calendarSelection.selectedItems.length > 0 && getFridgeItems().every(item => 
                calendarSelection.selectedItems.some(i => i.name === item.name)
              )
                ? "Deselect All" 
                : "Select All"}
            </Button>
          </div>
          {/* Fridge Item List */}
          <div>
          {getFridgeItems().length > 0 ? (
            <div className="p-4 h-[240px] overflow-y-auto">
              <ul className="space-y-2">
                {getFridgeItems().map((item) => {
                  const quantity = parseInt(item.quantity.split(' ')[0]) || 1;
                  return (
                    <li key={item.name} className="py-2 border-b last:border-0">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={calendarSelection.selectedItems.some(i => i.name === item.name)}
                          onChange={() => handleItemSelection(item.name, quantity, item.daysLeft)}
                          className="mr-2"
                        />
                        <div className="grid grid-cols-3 w-full items-center p-3 rounded-lg bg-blue-50">
                          <div className="text-left">{item.name}</div>
                          <div className="text-center text-gray-600">Qty: {quantity}</div>
                          <div className="text-right text-gray-600">Storage: {item.daysLeft || 7} days</div>
                        </div>
                      </label>
                    </li>
                  );
                })}
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
                const items = mapInventoryToCalendarItems(pantryItems);

                const pantryItemNames = pantryItems.map(item => item.name);
                const nonPantryItems = calendarSelection.selectedItems.filter(
                  item => !pantryItemNames.includes(item.name)
                );

                setCalendarSelection(prev => ({
                  ...prev,
                  selectedItems: pantryItems.every(item => 
                    prev.selectedItems.some(i => i.name === item.name)
                  )
                    ? nonPantryItems
                    : [...nonPantryItems, ...items]
                }));
              }}
              className="bg-amber-700 text-white px-4 py-2 rounded-lg"
            >
              {/* Check if all pantry items are selected */}
              {calendarSelection.selectedItems.length > 0 && getPantryItems().every(item => 
                calendarSelection.selectedItems.some(i => i.name === item.name)
              )
                ? "Deselect All" 
                : "Select All"}
            </Button>
          </div>
          {/* Pantry Item List */}
          <div>
          {getPantryItems().length > 0 ? (
            <div className="bg-white rounded-lg p-4 h-[240px] overflow-y-auto">
              <ul className="space-y-2">
                {getPantryItems().map((item) => {
                  const quantity = parseInt(item.quantity.split(' ')[0]) || 1;
                  return (
                    <li key={item.name} className="py-2 border-b border-gray-100 last:border-0">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={calendarSelection.selectedItems.some(i => i.name === item.name)}
                          onChange={() => handleItemSelection(item.name, quantity, item.daysLeft)}
                          className="mr-2"
                        />
                        <div className="grid grid-cols-3 w-full items-center p-3 rounded-lg bg-amber-50">
                          <div className="text-left">{item.name}</div>
                          <div className="text-center text-gray-600">Qty: {quantity}</div>
                          <div className="text-right text-gray-600">Storage: {item.daysLeft || 7} days</div>
                        </div>
                      </label>
                    </li>
                  );
                })}
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