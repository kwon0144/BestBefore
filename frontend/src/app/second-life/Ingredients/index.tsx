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
      <h3 className="text-lg font-medium text-gray-700 mb-4">Common food scraps:</h3>
      <div className="flex flex-wrap gap-3">
        {displayedIngredients.map((ingredient) => (
          <div
            key={ingredient}
            onClick={() => handleIngredientSelect(ingredient)}
            className="bg-white px-4 py-2 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition"
          >
            {ingredient}
          </div>
        ))}
      </div>
      
      {ingredients.length > initialDisplayCount && (
        <Button
          variant="light"
          size="sm"
          className="mt-4 text-[#2c5e2e]"
          onPress={() => setShowAllIngredients(!showAllIngredients)}
        >
          {showAllIngredients 
            ? <>Show Less <FontAwesomeIcon icon={faChevronUp} className="ml-1" /></>
            : <>See More <FontAwesomeIcon icon={faChevronDown} className="ml-1" /></>
          }
        </Button>
      )}
    </div>
  );
} 