/**
 * GroceryList Component
 * 
 * This component displays the generated grocery list based on selected meals,
 * organized by food categories. It intelligently identifies items already in the
 * user's pantry and marks them accordingly to prevent unnecessary purchases.
 */
import { forwardRef, useState } from "react";
import { Skeleton, Button, Input } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit, faCheck, faTimes, faPlus, faPen, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import InfoTooltip from "@/app/(components)/InfoTooltip";
import { GroceryItem, PantryItem } from "../interfaces/GroceryItem";

/**
 * Props for the GroceryList component
 * Used to manage the state of the grocery list
 */
interface GroceryListProps {
  selectedMeals: string[];
  pantryItems: PantryItem[];
  error: string | null;
  getGroceryItemsByCategory: (category: string) => GroceryItem[];
  loading: boolean;
}

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
  pantryItems,
  error,
  getGroceryItemsByCategory,
  loading
}, ref) => {
  // State for editable list and editing mode
  const [editableList, setEditableList] = useState<{[category: string]: {name: string, quantity: string}[]}>({});
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<{category: string, index: number} | null>(null);
  const [editValues, setEditValues] = useState<{name: string, quantity: string}>({name: '', quantity: ''});
  const [newItem, setNewItem] = useState<{name: string, quantity: string, category: string}>({
    name: '',
    quantity: '',
    category: 'Other'
  });
  const [addingNewItem, setAddingNewItem] = useState(false);

  // List of all categories
  const categories = [
    { name: 'Fish', column: 'left' },
    { name: 'Produce', column: 'left' },
    { name: 'Dairy', column: 'left' },
    { name: 'Meat', column: 'right' },
    { name: 'Grains', column: 'right' },
    { name: 'Condiments', column: 'right' },
    { name: 'Other', column: 'right' }
  ];

  // Initialize editable list from grocery items
  const initializeEditableList = () => {
    const list: {[category: string]: {name: string, quantity: string}[]} = {};
    
    categories.forEach(category => {
      const items = getGroceryItemsByCategory(category.name);
      if (items.length > 0) {
        list[category.name] = items.map(item => ({
          name: item.name,
          quantity: item.quantity
        }));
      } else {
        list[category.name] = [];
      }
    });
    
    setEditableList(list);
    setEditMode(true);
  };
  
  // Handler for editing an item
  const handleEdit = (category: string, index: number) => {
    setEditingItem({category, index});
    setEditValues({
      name: editableList[category][index].name,
      quantity: editableList[category][index].quantity
    });
  };
  
  // Handler for saving edits
  const handleSaveEdit = () => {
    if (!editingItem) return;
    
    const { category, index } = editingItem;
    const newList = { ...editableList };
    
    newList[category][index] = {
      name: editValues.name,
      quantity: editValues.quantity
    };
    
    setEditableList(newList);
    setEditingItem(null);
  };
  
  // Handler for deleting an item
  const handleDelete = (category: string, index: number) => {
    const newList = { ...editableList };
    newList[category].splice(index, 1);
    setEditableList(newList);
  };
  
  // Handler for adding a new item
  const handleAddNewItem = () => {
    if (!newItem.name || !newItem.quantity) return;
    
    const newList = { ...editableList };
    if (!newList[newItem.category]) {
      newList[newItem.category] = [];
    }
    
    newList[newItem.category].push({
      name: newItem.name,
      quantity: newItem.quantity
    });
    
    setEditableList(newList);
    setNewItem({
      name: '',
      quantity: '',
      category: 'Other'
    });
    setAddingNewItem(false);
  };
  
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
    // Use editable list in edit mode, otherwise use grocery items
    const items = editMode 
      ? editableList[category] || []
      : getGroceryItemsByCategory(category);
    
    if (items.length === 0 && !editMode) return null;
    
    return (
      <div key={category} className="mb-6">
        <h4 className={`font-medium ${getCategoryColor(category)} mb-2`}>{category}</h4>
        <ul className="space-y-2">
          {items.map((item, index) => {
            const { inPantry, isPartial, adjustedQuantity, originalQuantity } = editMode
              ? { inPantry: false, isPartial: false, adjustedQuantity: item.quantity, originalQuantity: item.quantity }
              : checkPantryAvailability(item.name, item.quantity);
            
            // If we're editing this specific item
            if (editMode && editingItem && editingItem.category === category && editingItem.index === index) {
              return (
                <li key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                  <Input
                    size="sm"
                    placeholder="Item name"
                    value={editValues.name}
                    onChange={(e) => setEditValues({...editValues, name: e.target.value})}
                    className="flex-grow"
                  />
                  <Input
                    size="sm"
                    placeholder="Quantity"
                    value={editValues.quantity}
                    onChange={(e) => setEditValues({...editValues, quantity: e.target.value})}
                    className="w-24"
                  />
                  <Button size="sm" isIconOnly color="success" onPress={handleSaveEdit}>
                    <FontAwesomeIcon icon={faCheck} className="text-white" />
                  </Button>
                  <Button size="sm" isIconOnly color="danger" onPress={() => setEditingItem(null)}>
                    <FontAwesomeIcon icon={faTimes} className="text-white" />
                  </Button>
                </li>
              );
            }
            
            return (
              <li key={index} className="flex justify-between items-center">
                {editMode ? (
                  <>
                    <span>{item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}</span>
                    <div className="flex items-center space-x-2">
                      <span>{item.quantity}</span>
                      <Button 
                        size="sm" 
                        isIconOnly 
                        variant="light" 
                        color="primary"
                        onPress={() => handleEdit(category, index)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button 
                        size="sm" 
                        isIconOnly 
                        variant="light" 
                        color="danger"
                        onPress={() => handleDelete(category, index)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
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
                        <span className={inPantry ? 'line-through text-gray-400' : 'text-gray-600'}>
                          {item.quantity}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  // Render the form for adding a new item
  const renderAddNewItemForm = () => {
    return (
      <div className="mt-4 p-6 bg-white border-2 border-green-200 shadow-md rounded-lg">
        <h4 className="font-medium text-lg text-darkgreen mb-4">Add New Item</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <Input
              placeholder="e.g., Apples"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              className="w-full"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <Input
              placeholder="e.g., 500g, 2 items"
              value={newItem.quantity}
              onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
              className="w-full"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              value={newItem.category}
              onChange={(e) => setNewItem({...newItem, category: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-2">
          <Button 
            color="success" 
            onPress={handleAddNewItem}
            disabled={!newItem.name || !newItem.quantity}
            className="bg-darkgreen hover:bg-darkgreen/90 text-white"
          >
            Add Item
          </Button>
          <Button 
            color="danger" 
            variant="light"
            onPress={() => setAddingNewItem(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-row gap-2">
          <h2 className="text-2xl font-semibold text-darkgreen">
            Grocery List
          </h2>
          <InfoTooltip 
            contentItems={[
              "The meal recommendations and grocery suggestions provided are based on general information and AI-generated content",
              "Ingredient quantities may vary based on recipe variations and actual quantities needed",
              "Always check for specific dietary requirements and food allergies before preparation"
            ]}
            header="For Reference Only"
            footerText="Recommendations for reference only"
            placement="right-start"
            icon={faCircleExclamation}
            ariaLabel="Disclaimer"
          />
        </div>
      <div className="flex justify-between items-center mb-4">
        {!loading && !error && selectedMeals.length > 0 && (
          <Button
            size="md"
            variant="light"
            className="text-[#2F5233] hover:bg-green-50 flex items-center gap-1.5 px-3 py-1.5"
            onPress={() => {
              if (!editMode) {
                initializeEditableList();
              } else {
                setEditMode(false);
              }
            }}
          >
            <span className="font-bold text-base">{editMode ? "Save" : "Edit"}</span>
            <FontAwesomeIcon icon={editMode ? faCheck : faPen} size="sm" />
          </Button>
        )}
      </div>
        
      {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">
        {error}
      </div>}
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {['left', 'right'].map((column) => (
            <div key={column} className="space-y-6">
              {categories
                .filter(cat => cat.column === column)
                .map((category) => (
                  <div key={category.name} className="space-y-3">
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
          ))}
        </div>
      ) : !error ? (
        selectedMeals.length === 0 ? (
          <p className="text-gray-500">Select meals to generate a grocery list</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6">
              {['left', 'right'].map((column) => (
                <div key={column}>
                  {categories
                    .filter(cat => cat.column === column)
                    .map(category => renderCategory(category.name))}
                </div>
              ))}
            </div>
            
            {/* Add new item button and form in edit mode */}
            {editMode && (
              <div className="mt-6">
                {addingNewItem ? (
                  renderAddNewItemForm()
                ) : (
                  <Button 
                    className="mt-auto w-full bg-[#2F5233] text-white text-sm py-3 rounded-lg shadow-sm hover:bg-[#2F5233]/80 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                    onPress={() => setAddingNewItem(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Add New Item</span>
                  </Button>
                )}
              </div>
            )}
            
            {/* Display pantry items info */}
            {!editMode && (
              <div className="mt-6 bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Note:</span> Items crossed out if food item in inventory can be used and don&apos;t need to be purchased.
                </p>
              </div>
            )}
          </>
        )
      ) : (
        <></>
      )}
    </div>
  );
});

GroceryList.displayName = 'GroceryList';

export default GroceryList; 