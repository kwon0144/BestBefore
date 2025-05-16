/**
 * Categories Component for Second Life
 * 
 * This component displays category filters for different types of
 * food waste repurposing ideas (craft, beauty, food, etc.).
 */
import { Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CategoriesProps } from "@/interfaces/SecondLifeItem";
import { forwardRef } from "react";

/**
 * Renders category filter buttons
 * 
 * @param {object} props - Component properties
 * @param {Array} props.categories - Array of categories with name and icon
 * @param {string|null} props.selectedCategory - Currently selected category
 * @param {Function} props.handleCategorySelect - Function to handle category selection
 * @returns {JSX.Element} Rendered categories component
 */
const Categories = forwardRef<HTMLDivElement, CategoriesProps>(({ 
  categories, 
  selectedCategory, 
  handleCategorySelect 
}, ref) => {
  return (
    <div ref={ref} className="mt-8 mb-16">
      <h2 className="text-2xl font-semibold text-darkgreen mb-4 border-b border-darkgreen pb-4">
        Filter by category:
      </h2>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <Button
            key={category.name}
            variant="light"
            size="sm"
            onPress={() => handleCategorySelect(category.name)}
            className={`${
              selectedCategory === category.name
                ? 'bg-[#2F5233] text-white hover:bg-[#1B371F]'
                : 'bg-white hover:bg-gray-100'
            } px-6 py-5 text-md rounded-lg shadow-sm transition cursor-pointer !rounded-button whitespace-nowrap`}
          >
            <FontAwesomeIcon icon={category.icon} className="mr-2" />
            <div>{category.name}</div>
          </Button>
        ))}
      </div>
    </div>
  );
});

Categories.displayName = 'Categories';

export default Categories; 