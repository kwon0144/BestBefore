/**
 * Categories Component for Second Life
 * 
 * This component displays category filters for the Second Life page,
 * allowing users to filter repurposing ideas by category.
 */
import { Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CategoriesProps } from "../interfaces";

/**
 * Renders category filter buttons
 * 
 * @param {object} props - Component properties
 * @param {Array} props.categories - Array of categories with name and icon
 * @param {string|null} props.selectedCategory - Currently selected category
 * @param {Function} props.handleCategorySelect - Function to handle category selection
 * @returns {JSX.Element} Rendered categories component
 */
export default function Categories({ 
  categories, 
  selectedCategory, 
  handleCategorySelect 
}: CategoriesProps) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-700 mb-4">Filter by category:</h3>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <Button
            key={category.name}
            onPress={() => handleCategorySelect(category.name)}
            className={`flex items-center py-2 px-4 rounded-lg !rounded-button whitespace-nowrap cursor-pointer ${
              selectedCategory === category.name
                ? 'bg-[#2c5e2e] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } shadow-sm transition-colors`}
          >
            <FontAwesomeIcon icon={category.icon} className="mr-2" />
            <span>{category.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
} 