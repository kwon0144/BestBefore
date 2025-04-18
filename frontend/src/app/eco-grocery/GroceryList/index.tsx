import { Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { GroceryListProps } from "../interfaces";

export default function GroceryList({
  selectedMeals,
  groceryItems,
  pantryItems,
  loading,
  error,
  groceryList,
  generateGroceryList,
  getGroceryItemsByCategory
}: GroceryListProps) {
  // List of categories to display
  const categories = [
    'Meat', 
    'Fish', 
    'Produce', 
    'Dairy', 
    'Grains', 
    'Condiments', 
    'Other'
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Smart Grocery List</h2>
      {error && (
        <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">
          Error: {error}
        </div>
      )}
      
      {groceryList && groceryList.success && (
        <div className="bg-green-50 p-3 rounded mb-4">
          <p className="text-green-700 font-medium">Successfully generated grocery list for {groceryList.dishes?.join(', ')}!</p>
        </div>
      )}
      
      {selectedMeals.length === 0 ? (
        <p className="text-gray-500 italic mb-4">Select meals to generate your grocery list.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Items to Buy */}
          <div>
            <h3 className="font-medium text-lg mb-3 text-[#2F5233]">Items to Buy</h3>
            {groceryItems.length === 0 ? (
              <p className="text-gray-500 italic">Generate a grocery list to see items you need to buy.</p>
            ) : (
              <div className="space-y-4">
                {/* Render each category section */}
                {categories.map((category) => (
                  getGroceryItemsByCategory(category).length > 0 && (
                    <div key={category}>
                      <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
                      <ul className="space-y-2">
                        {getGroceryItemsByCategory(category).map((item, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{item.name}</span>
                            <span className="text-gray-600">{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
          
          {/* Already in Pantry */}
          <div>
            <h3 className="font-medium text-lg mb-3 text-[#2F5233]">Already in Your Pantry</h3>
            {pantryItems.length === 0 ? (
              <p className="text-gray-500 italic">Generate a grocery list to see pantry items.</p>
            ) : (
              <ul className="space-y-2">
                {pantryItems.map((item, index) => (
                  <li key={index} className="flex justify-between items-center text-gray-500">
                    <span>{item.name}</span>
                    <span>{item.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      <Button
        className={`mt-8 w-full ${loading ? 'bg-gray-400' : 'bg-[#2F5233]'} text-white py-3 rounded-lg shadow-sm hover:bg-[#1B371F] transition ${selectedMeals.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} !rounded-button whitespace-nowrap`}
        disabled={selectedMeals.length === 0 || loading}
        onPress={generateGroceryList}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
            Generating...
          </span>
        ) : (
          'Generate Final Grocery List'
        )}
      </Button>
      
      {/* Debug Section - Only visible during development */}
      {process.env.NODE_ENV === 'development' && groceryList && (
        <div className="mt-6 p-4 bg-slate-100 rounded text-xs overflow-auto max-h-96">
          <h4 className="font-medium mb-2">API Response:</h4>
          <pre>{JSON.stringify(groceryList, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 