/**
 * SelectedMeal Component
 * 
 * This component displays the list of meals the user has selected for their meal plan.
 * It allows users to:
 * - Adjust the quantity of each meal
 * - Remove meals from the selection
 * - Generate a grocery list based on selected meals
 * 
 * The component shows a loading state when the grocery list is being generated
 * and provides clear feedback when no meals are selected.
 */
import { Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus, faXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";
import type { Meal } from "../interfaces/MealChoice";

/**
 * Props for the SelectedMeals component
 */
export interface SelectedMealsProps {
  selectedMeals: Meal[];
  adjustQuantity: (id: number, change: number) => void;
  removeMeal: (id: number) => void;
}

/**
 * Extended props interface for SelectedMeal component with additional properties
 * @interface
 */
export interface SelectedMealWithButtonProps extends SelectedMealsProps {
  onGenerate: () => void;
  loading: boolean;
}

/**
 * Renders the list of selected meals with controls for adjusting quantities
 * and a button to generate the grocery list
 * 
 * @param {object} props - Component properties
 * @param {Array} props.selectedMeals - Meals selected by the user
 * @param {Function} props.adjustQuantity - Function to adjust meal quantities
 * @param {Function} props.removeMeal - Function to remove a meal from selection
 * @param {Function} props.generateGroceryList - Function to generate the grocery list
 * @param {boolean} props.loading - Whether the grocery list is being generated
 * @returns {JSX.Element} Rendered selected meals component
 */
export default function SelectedMeal({ 
  selectedMeals, 
  adjustQuantity, 
  removeMeal, 
  onGenerate, 
  loading 
}: SelectedMealWithButtonProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
      <h2 className="text-2xl font-semibold text-darkgreen mb-3">
        Your Selected Meals
      </h2>
      <div className="overflow-y-auto flex-grow min-h-[350px] max-h-[350px] pr-1 -mr-1 mb-4">
        {selectedMeals.length === 0 ? (
          <p className="text-gray-500 italic text-sm">No meals selected yet. Add meals from the choices above or search for your own.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {selectedMeals.map((meal) => (
              <li key={meal.id} className="py-2 flex justify-between items-center text-sm">
                <span className="font-medium truncate mr-2">{meal.name}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Combined quantity control in a single container */}
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <button
                      className="px-1 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200"
                      onClick={() => adjustQuantity(meal.id, -1)}
                    >
                      <FontAwesomeIcon icon={faMinus} size="xs" />
                    </button>
                    <span className="px-2 text-center text-sm font-medium">{meal.quantity}</span>
                    <button
                      className="px-1 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200"
                      onClick={() => adjustQuantity(meal.id, 1)}
                    >
                      <FontAwesomeIcon icon={faPlus} size="xs" />
                    </button>
                  </div>
                  
                  <Button
                    isIconOnly
                    variant="light"
                    color="danger"
                    size="sm"
                    onPress={() => removeMeal(meal.id)}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Generate Grocery List Button */}
      <Button
        className={`mt-auto w-full ${loading ? 'bg-gray-400' : 'bg-[#2F5233]'} text-white py-3 rounded-lg shadow-sm hover:bg-[#1B371F] transition ${selectedMeals.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} !rounded-button whitespace-nowrap`}
        disabled={selectedMeals.length === 0 || loading}
        onPress={onGenerate}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
            Generating...
          </span>
        ) : (
          'Generate Grocery List'
        )}
      </Button>
    </div>
  );
}