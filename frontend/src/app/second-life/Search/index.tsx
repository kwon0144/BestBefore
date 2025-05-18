/**
 * Search Component for Second Life
 * 
 * This component provides a search input for users to find food waste repurposing ideas.
 */
import { Input, Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

/**
 * Props for the Search component
 * Used to manage search functionality in the Second Life feature
 */
export interface SearchProps {
  setSearchQuery: (query: string) => void;
  setSelectedIngredient: (ingredient: string | null) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
}

/**
 * Renders a search input field for the Second Life page
 * 
 * @param {object} props - Component properties
 * @param {Function} props.setSearchQuery - Function to update search query
 * @param {Function} props.setSelectedIngredient - Function to clear selected ingredient
 * @param {string} props.inputValue - Current input value
 * @param {Function} props.setInputValue - Function to update input value
 * @returns {JSX.Element} Rendered search component
 */
export default function Search({ 
  setSearchQuery, 
  setSelectedIngredient,
  inputValue,
  setInputValue
}: SearchProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSelectedIngredient(null);
      setSearchQuery(inputValue);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setInputValue("");
  };

  const handleSearchClick = () => {
    setSelectedIngredient(null);
    setSearchQuery(inputValue);
  };

  return (
    <div className="mb-8 max-w-xl mx-auto">
      <div className="relative flex gap-2">
        <Input
          type="text"
          placeholder="Search food items to repurpose..."
          classNames={{
            inputWrapper: "w-full py-3 px-4 pr-10 border-none bg-white border-1 shadow-md"
          }}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          startContent={<FontAwesomeIcon icon={faMagnifyingGlass} />}
          onClear={handleClear}
        />
        <Button 
          color="primary"
          onPress={handleSearchClick}
          className="px-6"
        >
          Search
        </Button>
      </div>
    </div>
  );
} 