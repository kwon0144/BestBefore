/**
 * Search Component for Second Life
 * 
 * This component provides a search input for users to find food waste repurposing ideas.
 */
import { Input } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { SearchProps } from "../interfaces";

/**
 * Renders a search input field for the Second Life page
 * 
 * @param {object} props - Component properties
 * @param {string} props.searchQuery - Current search query
 * @param {Function} props.setSearchQuery - Function to update search query
 * @returns {JSX.Element} Rendered search component
 */
export default function Search({ searchQuery, setSearchQuery }: SearchProps) {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="mb-8 max-w-xl mx-auto">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search food items to repurpose..."
          classNames={{
            inputWrapper: "w-full py-3 px-4 pr-10 border-none bg-white border-1 shadow-md"
          }}
          value={searchQuery}
          onChange={handleSearch}
          startContent={<FontAwesomeIcon icon={faMagnifyingGlass} />}
          onClear={() => setSearchQuery("")}
        />
      </div>
    </div>
  );
} 