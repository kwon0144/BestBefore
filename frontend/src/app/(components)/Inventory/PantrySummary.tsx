import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import useInventoryStore from "@/store/useInventoryStore";
import InventoryModal from "./InventoryModal";

export default function PantrySummary() {
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const getItemsByLocation = useInventoryStore((state) => state.getItemsByLocation);
  const items = useInventoryStore((state) => state.items);
  const refreshDaysLeft = useInventoryStore((state) => state.refreshDaysLeft);

  // Refresh days left on component mount
  useEffect(() => {
    refreshDaysLeft();
  }, [refreshDaysLeft]);

  // Check if inventory is empty
  const isInventoryEmpty = items.length === 0;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col w-full">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Your Food Inventory</h2>
        
        {isInventoryEmpty ? (
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <p className="font-medium text-blue-700 mb-2">No items in your inventory yet!</p>
            <p className="text-blue-600">
              Use the "Storage Assistant" feature to quickly add items by taking photos of your groceries, 
              or add items manually by clicking the "Update Inventory" button below.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-[#2F5233] mb-3">Refrigerator</h3>
              <ul className="space-y-2">
                {getItemsByLocation('refrigerator').map(item => (
                  <li key={item.id} className="flex justify-between items-center">
                    <span>{item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{item.quantity}</span>
                      <span className={`text-sm ${
                        item.daysLeft && item.daysLeft <= 1 ? 'text-red-500' :
                        item.daysLeft && item.daysLeft <= 3 ? 'text-orange-500' : 'text-green-500'
                      }`}>
                        {item.daysLeft} {item.daysLeft === 1 ? 'day' : 'days'} left
                      </span>
                    </div>
                  </li>
                ))}
                {getItemsByLocation('refrigerator').length === 0 && (
                  <li className="text-gray-500 italic">No items in refrigerator</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-[#2F5233] mb-3">Pantry</h3>
              <ul className="space-y-2">
                {getItemsByLocation('pantry').map(item => (
                  <li key={item.id} className="flex justify-between items-center">
                    <span>{item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{item.quantity}</span>
                      <span className={`text-sm ${
                        item.daysLeft && item.daysLeft <= 7 ? 'text-red-500' :
                        item.daysLeft && item.daysLeft <= 14 ? 'text-orange-500' : 'text-green-500'
                      }`}>
                        {item.daysLeft} days left
                      </span>
                    </div>
                  </li>
                ))}
                {getItemsByLocation('pantry').length === 0 && (
                  <li className="text-gray-500 italic">No items in pantry</li>
                )}
              </ul>
            </div>
          </div>
        )}
        
        <Button 
          className="mt-6 w-full bg-[#2F5233] text-white py-3 rounded-lg shadow-sm hover:bg-[#1B371F] transition cursor-pointer !rounded-button whitespace-nowrap"
          onPress={() => setIsInventoryModalOpen(true)}
        >
          {isInventoryEmpty ? "Add Items to Inventory" : "Update Inventory"}
        </Button>
      </div>
      
      <InventoryModal 
        isOpen={isInventoryModalOpen} 
        onClose={() => setIsInventoryModalOpen(false)} 
      />
    </>
  );
} 