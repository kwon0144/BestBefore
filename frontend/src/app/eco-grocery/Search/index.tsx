import { Input, Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { SearchBarProps } from "../interfaces";

export default function Search({
  searchQuery,
  setSearchQuery,
  addSearchResultMeal
}: SearchBarProps) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 mb-8">
      <div className="flex-grow">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for meals or enter your own..."
            classNames={{
              inputWrapper: "w-full py-3 px-4 pr-10 border-none bg-white border-1 shadow-md"
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <FontAwesomeIcon icon={faSearch} />
          </div>
        </div>
      </div>
      <Button
        className="bg-[#2F5233] text-white px-6 py-3 rounded-lg shadow-sm hover:bg-[#1B371F] transition cursor-pointer !rounded-button whitespace-nowrap"
        onPress={addSearchResultMeal}
        isDisabled={!searchQuery.trim()}
      >
        Add Custom Meal
      </Button>
    </div>
  );
} 