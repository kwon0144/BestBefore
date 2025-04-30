import { forwardRef } from "react";
import { GroceryListProps } from "../interfaces";
import { Skeleton } from "@heroui/react";

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
  
  // Helper function to check if an item is in the pantry
  const isInPantry = (itemName: string) => {
    return pantryItems.some(pantryItem => 
      pantryItem.name.toLowerCase() === itemName.toLowerCase()
    );
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
  
  // Render a category section
  const renderCategory = (category: string) => {
    if (getGroceryItemsByCategory(category).length === 0) return null;
    
    return (
      <div key={category} className="mb-6">
        <h4 className={`font-medium ${getCategoryColor(category)} mb-2`}>{category}</h4>
        <ul className="space-y-2">
          {getGroceryItemsByCategory(category).map((item, index) => {
            const inPantry = isInPantry(item.name);
            return (
              <li key={index} className="flex justify-between items-center">
                <span className={inPantry ? 'line-through text-gray-400' : ''}>
                  {item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}
                </span>
                <span className={`text-gray-600 ${inPantry ? 'text-gray-400' : ''}`}>{item.quantity}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div ref={ref} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-darkgreen mb-4">
        Your Smart Grocery List
      </h2>
      {error && (
        <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">
          {error}
        </div>
      )}

      {selectedMeals.length === 0 ? (
        <p className="text-gray-500 italic mb-4">Select meals to generate your grocery list.</p>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {/* Left Column */}
          <div className="space-y-6">
            {['Fish', 'Produce'].map((category) => (
              <div key={category} className="space-y-3">
                <Skeleton className="h-6 w-24 rounded-lg" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-3/5 rounded-lg" />
                      <Skeleton className="h-4 w-12 rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {['Meat', 'Grains'].map((category) => (
              <div key={category} className="space-y-3">
                <Skeleton className="h-6 w-24 rounded-lg" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-3/5 rounded-lg" />
                      <Skeleton className="h-4 w-12 rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Items to Buy */}
          {groceryItems.length === 0 ? (
            (!error && !loading) && <p className="text-gray-500 italic">Generate a grocery list to see items you need to buy.</p>
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
                    <span className="font-medium">Note:</span> Items crossed out are already in your food inventory and don&apos;t need to be purchased.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
});

GroceryList.displayName = 'GroceryList';

export default GroceryList; 