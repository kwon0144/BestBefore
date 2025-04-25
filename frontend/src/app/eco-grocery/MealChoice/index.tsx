import { useState } from "react";
import { Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSpinner, faUtensils } from "@fortawesome/free-solid-svg-icons";
import { MealChoicesProps } from "../interfaces";

export default function MealChoice({ 
  mealChoices, 
  filteredMealChoices, 
  addMeal,
  isLoading = false,
  selectedCuisine = null
}: MealChoicesProps) {
  // Determine the title based on whether signature dishes are being shown
  const title = selectedCuisine ? `Signature Dishes from ${selectedCuisine}` : "Choices of Meals";

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <FontAwesomeIcon icon={faSpinner} spin className="text-emerald-500 h-8 w-8" />
          <span className="ml-2 text-gray-600">Loading signature dishes...</span>
        </div>
      ) : filteredMealChoices.length === 0 && selectedCuisine ? (
        <p className="text-gray-500 italic">No signature dishes found for {selectedCuisine}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredMealChoices.map((meal) => (
            <div key={meal.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-32 overflow-hidden">
                {meal.imageUrl ? (
                  <img
                    src={meal.imageUrl}
                    alt={meal.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <FontAwesomeIcon icon={faUtensils} className="text-gray-400 h-12 w-12" />
                  </div>
                )}
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
      )}
    </div>
  );
} 