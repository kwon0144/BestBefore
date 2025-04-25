import { Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { SelectedMealsProps } from "../interfaces";

export default function SelectedMeal({ selectedMeals, adjustQuantity, removeMeal }: SelectedMealsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Selected Meals</h2>
      {selectedMeals.length === 0 ? (
        <p className="text-gray-500 italic">No meals selected yet. Add meals from the choices above or search for your own.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {selectedMeals.map((meal) => (
            <li key={meal.id} className="py-3 flex justify-between items-center">
              <span className="font-medium">{meal.name}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <Button
                    className="text-gray-500 hover:text-[#2F5233] w-6 h-6 flex items-center justify-center cursor-pointer !rounded-button whitespace-nowrap"
                    onPress={() => adjustQuantity(meal.id, -1)}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </Button>
                  <span className="mx-2 w-6 text-center">{meal.quantity}</span>
                  <Button
                    className="text-gray-500 hover:text-[#2F5233] w-6 h-6 flex items-center justify-center cursor-pointer !rounded-button whitespace-nowrap"
                    onPress={() => adjustQuantity(meal.id, 1)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
                </div>
                <Button
                  className="text-red-500 hover:text-red-700 cursor-pointer !rounded-button whitespace-nowrap"
                  onPress={() => removeMeal(meal.id)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 