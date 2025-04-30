import { Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus, faXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { SelectedMealsProps } from "../interfaces";

export interface SelectedMealWithButtonProps extends SelectedMealsProps {
  onGenerate: () => void;
  loading: boolean;
}

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
      {selectedMeals.length === 0 ? (
        <p className="text-gray-500 italic text-sm mb-4">No meals selected yet. Add meals from the choices above or search for your own.</p>
      ) : (
        <div className="overflow-y-auto max-h-[350px] pr-1 -mr-1 mb-4">
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
        </div>
      )}
      
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