/**
 * GroceryList Component
 * 
 * This component displays the generated grocery list based on selected meals,
 * organized by food categories. It intelligently identifies items already in the
 * user's pantry and marks them accordingly to prevent unnecessary purchases.
 */
import { GroceryListProps } from "../interfaces";

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
export default function GroceryList({
  selectedMeals,
  groceryItems,
  pantryItems,
  error,
  getGroceryItemsByCategory
}: Omit<GroceryListProps, 'generateGroceryList'>) {
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
        <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Smart Grocery List</h2>
      {error && (
        <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">
          Error: {error}
        </div>
      )}
      
      {selectedMeals.length === 0 ? (
        <p className="text-gray-500 italic mb-4">Select meals to generate your grocery list.</p>
      ) : (
        <div>
          {/* Items to Buy */}
          <h3 className="font-medium text-lg mb-4 text-[#2F5233]">Items to Buy</h3>
          {groceryItems.length === 0 ? (
            <p className="text-gray-500 italic">Generate a grocery list to see items you need to buy.</p>
          ) : (
            <>
              {/* Two-column grid for categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                {/* Left Column */}
                <div>
                  {leftColumnCategories.map(category => renderCategory(category))}
                </div>
                
                {/* Right Column */}
                <div>
                  {rightColumnCategories.map(category => renderCategory(category))}
                </div>
              </div>
              
              {/* Display pantry items info */}
              {pantryItems.length > 0 && (
                <div className="mt-6 bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Note:</span> Items crossed out are already in your food inventory and don&apos;t need to be purchased. Items with reduced quantities show what you still need to buy based on what you already have.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
} 