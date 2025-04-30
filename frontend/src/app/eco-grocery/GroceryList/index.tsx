/**
 * GroceryList Component
 * 
 * This component displays the generated grocery list based on selected meals,
 * organized by food categories. It intelligently identifies items already in the
 * user's pantry and marks them accordingly to prevent unnecessary purchases.
 */
import { forwardRef } from "react";
import { GroceryListProps } from "../interfaces";
import { Skeleton } from "@heroui/react";

/**
 * Renders a categorized list of grocery items needed for selected meals
 * 
 * @param {object} props - Component properties
 * @param {Array} props.selectedMeals - Meals selected by the user
 * @param {Array} props.groceryItems - Items needed for the selected meals
 * @param {Array} props.pantryItems - Items already available in user's pantry
 * @param {string|null} props.error - Error message, if any
 * @param {Function} props.getGroceryItemsByCategory - Function to filter items by category
 * @returns {JSX.Element} Rendered grocery list component
 */
const GroceryList = forwardRef<HTMLDivElement, Omit<GroceryListProps, 'generateGroceryList'>>(({
  selectedMeals,
  groceryItems,
  pantryItems,
  error,
  getGroceryItemsByCategory,
  loading
}, ref) => {
  // List of all categories
  const leftColumnCategories = ['Fish', 'Produce', 'Dairy'];
  const rightColumnCategories = ['Meat', 'Grains', 'Condiments', 'Other'];
  
  /**
   * Checks if a grocery item is already available in the pantry and returns quantity info
   * 
   * @param {string} itemName - Name of the grocery item to check
   * @param {string} groceryQuantity - Quantity needed from grocery list
   * @returns {object} Status of item availability and adjusted quantity if partial
   */
  const checkPantryAvailability = (itemName: string, groceryQuantity: string) => {
    const matchingPantryItem = pantryItems.find(pantryItem => 
      pantryItem.name.toLowerCase() === itemName.toLowerCase()
    );
    
    if (!matchingPantryItem) {
      return { inPantry: false, adjustedQuantity: groceryQuantity };
    }
    
    // Extract numerical values from quantities for comparison
    const groceryNumValue = extractNumericValue(groceryQuantity);
    const pantryNumValue = extractNumericValue(matchingPantryItem.quantity);
    const groceryUnit = extractUnit(groceryQuantity);
    const pantryUnit = extractUnit(matchingPantryItem.quantity);
    
    // If units don't match or we can't extract values, treat as complete match
    if (!groceryNumValue || !pantryNumValue || groceryUnit !== pantryUnit) {
      return { inPantry: true, adjustedQuantity: groceryQuantity };
    }
    
    // Check if pantry has enough
    if (pantryNumValue >= groceryNumValue) {
      return { inPantry: true, adjustedQuantity: groceryQuantity };
    }
    
    // Calculate remaining quantity needed
    const remainingValue = groceryNumValue - pantryNumValue;
    return { 
      inPantry: false, 
      isPartial: true,
      originalQuantity: groceryQuantity,
      pantryQuantity: `${pantryNumValue}${groceryUnit}`,
      adjustedQuantity: `${remainingValue}${groceryUnit}` 
    };
  };
  
  /**
   * Extracts numeric value from a quantity string
   * 
   * @param {string} quantity - Quantity string (e.g., "500g", "2 L")
   * @returns {number|null} Extracted numeric value or null if not found
   */
  const extractNumericValue = (quantity: string): number | null => {
    const match = quantity.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : null;
  };
  
  /**
   * Extracts unit from a quantity string
   * 
   * @param {string} quantity - Quantity string (e.g., "500g", "2 L")
   * @returns {string} Extracted unit or empty string if not found
   */
  const extractUnit = (quantity: string): string => {
    const match = quantity.match(/[a-zA-Z]+$/);
    return match ? match[0].toLowerCase() : '';
  };

  // Helper function to get category color
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fish':
        return 'text-blue-600 border-b-2 border-blue-600';
      case 'produce':
        return 'text-green border-b-2 border-green';
      case 'dairy':
        return 'text-yellow-600 border-b-2 border-yellow-600';
      case 'meat':
        return 'text-red-600 border-b-2 border-red-600';
      case 'grains':
        return 'text-amber-800 border-b-2 border-amber-800';
      case 'condiments':
        return 'text-orange-600 border-b-2 border-orange-600';
      default:
        return 'text-gray-500 border-b-2 border-gray-500';
    }
  };
  
  /**
   * Renders a category section with its items
   * 
   * @param {string} category - Category name to render
   * @returns {JSX.Element|null} Rendered category section or null if empty
   */
  const renderCategory = (category: string) => {
    if (getGroceryItemsByCategory(category).length === 0) return null;
    
    return (
      <div key={category} className="mb-6">
        <h4 className={`font-medium ${getCategoryColor(category)} mb-2`}>{category}</h4>
        <ul className="space-y-2">
          {getGroceryItemsByCategory(category).map((item, index) => {
            const { inPantry, isPartial, adjustedQuantity, originalQuantity, pantryQuantity } = checkPantryAvailability(item.name, item.quantity);
            
            return (
              <li key={index} className="flex justify-between items-center">
                <span className={inPantry ? 'line-through text-gray-400' : ''}>
                  {item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}
                </span>
                <div className="flex items-center">
                  {isPartial ? (
                    <div className="flex items-center">
                      <span className="text-gray-400 line-through mr-1">{originalQuantity}</span>
                      <span className="text-gray-400 mx-1">-&gt;</span>
                      <span className="text-gray-600">{adjustedQuantity}</span>
                    </div>
                  ) : (
                    <span className={`text-gray-600 ${inPantry ? 'text-gray-400' : ''}`}>
                      {item.quantity}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div ref={ref} className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Grocery List</h3>
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : selectedMeals.length === 0 ? (
        <p className="text-gray-500">Select meals to generate a grocery list</p>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div>
            {leftColumnCategories.map(category => renderCategory(category))}
          </div>
          <div>
            {rightColumnCategories.map(category => renderCategory(category))}
          </div>
        </div>
      )}
    </div>
  );
});

GroceryList.displayName = 'GroceryList';

export default GroceryList; 