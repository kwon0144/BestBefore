/**
 * PantrySummary Component
 * 
 * This component displays a summary of the user's food inventory, separated by location
 * (refrigerator and pantry). It shows food items with their quantities and days left until
 * expiry, highlighting items that are close to expiring. It also provides access to the 
 * full inventory management modal.
 */
import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import useInventoryStore from "@/store/useInventoryStore";
import InventoryModal from "./InventoryModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import NoScrollLink from "../NoScrollLink";

/**
 * PantrySummary component renders a summary view of the user's food inventory
 * 
 * @returns {JSX.Element} Rendered component showing food items by location with expiry information
 */
export default function PantrySummary() {
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const getItemsByLocation = useInventoryStore((state) => state.getItemsByLocation);
  const items = useInventoryStore((state) => state.items);
  const refreshDaysLeft = useInventoryStore((state) => state.refreshDaysLeft);

  /**
   * Formats quantity string for display with appropriate units
   * 
   * @param {string} quantity - The quantity value to format
   * @returns {string} Formatted quantity string
   */
  const formatQuantity = (quantity: string) => {
    // If it ends with g, kg, ml, l, L, or contains any letter, show as is
    if (/\d+\s*(g|kg|ml|l|L)$/i.test(quantity) || /[a-zA-Z]/.test(quantity.replace(/\d+/g, ''))) {
      return quantity;
    }
    // If it's just a number, show as qty: X
    if (/^\d+$/.test(quantity.trim())) {
      return `qty: ${quantity.trim()}`;
    }
    return quantity;
  };

  /**
   * Effect to refresh days left calculation whenever component mounts
   */
  useEffect(() => {
    refreshDaysLeft();
  }, [refreshDaysLeft]);

  // Check if inventory is empty
  const isInventoryEmpty = items.length === 0;

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md p-4 h-full flex flex-col w-full transition-opacity duration-200 ${isNavigating ? 'opacity-70' : 'opacity-100'}`}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-semibold text-darkgreen">
            Your Food Inventory
          </h2>
          <Button
            size="md"
            variant="light"
            className="text-[#2F5233] bg-lightgreen/20 flex items-center gap-1.5 px-3 py-1.5"
            onPress={() => setIsInventoryModalOpen(true)}
          >
            <span className="font-bold text-base">Edit</span>
            <FontAwesomeIcon icon={faPen} size="sm" />
          </Button>
        </div>
        
        {isInventoryEmpty ? (
          <div className="bg-amber-50 p-4 rounded-md mb-6">
            <p className="font-medium text-amber-700 mb-2">No items in your inventory yet!</p>
            <p className="text-amber-600">
              Use the &quot;Storage Assistant&quot; feature to quickly add items by taking photos of your groceries, 
              or add items manually by clicking the &quot;Edit&quot; button above.
            </p>
          </div>
        ) : (
          <div className="space-y-6 mb-6 flex-grow">
            <div>
              <h3 className="font-medium text-[#2F5233] mb-3 text-blue-500 border-b-2 border-blue-500">Refrigerator</h3>
              <ul className="space-y-2">
                {getItemsByLocation('refrigerator').map(item => (
                  <li key={item.id} className="flex justify-between items-center">
                    <span>{item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{formatQuantity(item.quantity)}</span>
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
              <h3 className="font-medium text-[#2F5233] mb-3 text-amber-700 border-b-2 border-amber-700">Pantry</h3>
              <ul className="space-y-2">
                {getItemsByLocation('pantry').map(item => (
                  <li key={item.id} className="flex justify-between items-center">
                    <span>{item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{formatQuantity(item.quantity)}</span>
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
        
        <NoScrollLink href="/storage-assistant">
          <div 
            className="mt-auto w-full bg-[#2F5233] text-white text-sm py-3 rounded-lg shadow-sm hover:bg-[#2F5233]/80 transition-all duration-200 cursor-pointer !rounded-button whitespace-nowrap flex items-center justify-center gap-2"
            style={{ pointerEvents: isNavigating ? 'none' : 'auto', opacity: isNavigating ? 0.7 : 1 }}
            onClick={() => setIsNavigating(true)}
          >
            <span>Go to Storage Assistant to add items</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </div>
        </NoScrollLink>
      </div>
      
      <InventoryModal 
        isOpen={isInventoryModalOpen} 
        onClose={() => setIsInventoryModalOpen(false)} 
      />
    </>
  );
} 