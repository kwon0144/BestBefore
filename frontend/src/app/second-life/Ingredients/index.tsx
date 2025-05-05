/**
 * Ingredients Component for Second Life
 * 
 * This component displays common food scraps that users can click
 * to quickly find repurposing ideas for specific ingredients.
 */
import { useState } from "react";
import { Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { IngredientsProps } from "../interfaces";

/**
 * Renders a grid of common food scraps that users can select
 * 
 * @param {object} props - Component properties
 * @param {string[]} props.ingredients - Array of ingredients to display
 * @param {string|null} props.selectedIngredient - Currently selected ingredient
 * @param {Function} props.handleIngredientSelect - Function to handle ingredient selection
 * @returns {JSX.Element} Rendered ingredients component
 */
export default function Ingredients({ 
  ingredients, 
  selectedIngredient, 
  handleIngredientSelect 
}: IngredientsProps) {
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  
  // Number of ingredients to show initially
  const initialDisplayCount = 6;
  const displayedIngredients = showAllIngredients 
    ? ingredients 
    : ingredients.slice(0, initialDisplayCount);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-darkgreen mb-4 border-b border-darkgreen pb-4">
        Common Food Scraps
      </h2>
      <div className="flex flex-wrap gap-3">
        {displayedIngredients.map((ingredient) => (
          <div
            key={ingredient}
            onClick={() => handleIngredientSelect(ingredient)}
            className={`${
              selectedIngredient === ingredient
                ? 'bg-[#2F5233] text-white hover:bg-[#1B371F]'
                : 'bg-white hover:bg-gray-100'
            } px-6 py-2 text-md rounded-lg shadow-sm transition cursor-pointer !rounded-button whitespace-nowrap`}
          >
            {ingredient}
          </div>
        ))}
        {ingredients.length > initialDisplayCount && (
          <Button
            variant="light"
            size="sm"
            className="text-[#2c5e2e] text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition h-[40px] flex items-center"
            onPress={() => setShowAllIngredients(!showAllIngredients)}
          >
            {showAllIngredients 
              ? <>Show Less <FontAwesomeIcon icon={faChevronUp} className="ml-1" /></>
              : <>See More <FontAwesomeIcon icon={faChevronDown} className="ml-1" /></>
            }
          </Button>
        )}
      </div>
    </div>
  );
} 