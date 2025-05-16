/**
 * MealChoice Component
 * 
 * This component displays a grid of meal options that users can select for their meal plan.
 * It shows either standard meal choices or cuisine-specific signature dishes based on user selection.
 * Each meal is displayed with an image, name, description, and an add button.
 */
import { Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSpinner, faUtensils, faImage, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { MealChoicesProps } from "@/app/eco-grocery/interfaces/MealChoice";
import Image from "next/image";
import { useState } from "react";

/**
 * Renders a grid of meal choices for user selection
 * 
 * @param {object} props - Component properties
 * @param {Array} props.filteredMealChoices - Meals to display, filtered by search or cuisine
 * @param {Function} props.addMeal - Function to add a meal to the selected meals list
 * @param {boolean} props.isLoading - Whether signature dishes are being loaded
 * @param {string|null} props.selectedCuisine - Currently selected cuisine category, if any
 * @param {string|null} props.error - Error message if signature dishes failed to load
 * @returns {JSX.Element} Rendered meal choices component
 */
export default function MealChoice({ 
  filteredMealChoices, 
  addMeal,
  isLoading = false,
  selectedCuisine = null,
  error = null
}: MealChoicesProps) {
  // Determine the title based on whether signature dishes are being shown
  const title = selectedCuisine ? `Signature Dishes from ${selectedCuisine}` : "Choices of Meals";

  // Track image loading errors
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Handle image load error
  const handleImageError = (mealId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [mealId]: true
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-semibold text-darkgreen mb-4">
        {title}
      </h2>
      
      <div className="overflow-y-auto flex-grow min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <FontAwesomeIcon icon={faSpinner} spin className="text-emerald-500 h-8 w-8" />
            <span className="ml-2 text-gray-600">Loading signature dishes...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-40 p-6 bg-red-50 rounded-lg">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 h-6 w-6" />
            <span className="ml-2 text-red-600">{error}</span>
          </div>
        ) : filteredMealChoices.length === 0 && selectedCuisine ? (
          <p className="text-gray-500 italic">No signature dishes found for {selectedCuisine}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredMealChoices.map((meal) => (
              <div key={meal.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-32 overflow-hidden">
                  {meal.imageUrl && !imageErrors[meal.id] ? (
                    <Image
                      src={meal.imageUrl}
                      alt={meal.name}
                      className="object-cover object-top"
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      onError={() => handleImageError(meal.id)}
                      unoptimized={meal.imageUrl.startsWith('https://s3-')}
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
    </div>
  );
} 