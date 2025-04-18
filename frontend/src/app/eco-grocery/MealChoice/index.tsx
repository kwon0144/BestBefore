import { Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { MealChoicesProps } from "../interfaces";

export default function MealChoice({ mealChoices, filteredMealChoices, addMeal }: MealChoicesProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Choices of Meals</h2>
      <div className="grid grid-cols-2 gap-4">
        {filteredMealChoices.map((meal) => (
          <div key={meal.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-32 overflow-hidden">
              <img
                src={meal.imageUrl}
                alt={meal.name}
                className="w-full h-full object-cover object-top"
              />
              <Button
                className="absolute top-2 right-2 bg-[#2F5233] text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-[#1B371F] transition cursor-pointer !rounded-button whitespace-nowrap"
                onPress={() => addMeal({id: meal.id, name: meal.name})}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm">{meal.name}</h3>
              <p className="text-gray-600 text-xs mt-1">{meal.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 