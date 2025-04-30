import { Input, Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUtensils } from "@fortawesome/free-solid-svg-icons";
import { SearchBarProps } from "../interfaces";
import Image from "next/image";

// Helper function to highlight matching text
const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? 
        <span key={i} className="bg-yellow-100 font-semibold">{part}</span> : 
        part
    );
};

export default function Search({
  searchQuery,
  setSearchQuery,
  addSearchResultMeal,
  handleSearchKeyPress,
  filteredResults,
  onSelectMeal
}: SearchBarProps) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
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
              onKeyPress={handleSearchKeyPress}
              startContent={<FontAwesomeIcon icon={faSearch} className="text-gray-400" />}
              onClear={() => {
                setSearchQuery("");
              }}
            />
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

      {/* Search Results */}
      {searchQuery && (
        <div className="bg-white rounded-lg shadow-md p-4 max-h-96 overflow-y-auto">
          {filteredResults.length > 0 ? (
            <div className="space-y-2">
              {filteredResults.map((result) => (
                <div
                  key={result.id}
                  className="p-3 hover:bg-gray-50 rounded-md cursor-pointer flex items-center gap-4 border-b border-gray-100 last:border-0"
                  onClick={() => onSelectMeal(result)}
                >
                  <div className="flex-shrink-0">
                    {result.imageUrl ? (
                      <Image
                        src={result.imageUrl}
                        alt={result.name}
                        width={48}
                        height={48}
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUtensils} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="font-medium text-gray-900">
                      {highlightMatch(result.name, searchQuery)}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-1">
                      {highlightMatch(result.description, searchQuery)}
                    </div>
                    {result.cuisine && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          {highlightMatch(result.cuisine, searchQuery)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-4xl mb-4" />
              <p className="text-gray-500">No preset meals matching &quot;{searchQuery}&quot;</p>
              <p className="text-sm text-gray-500 mt-2">No worries -- you can still add it as custom meal, and we&apos;ll use it to build your grocery list.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 