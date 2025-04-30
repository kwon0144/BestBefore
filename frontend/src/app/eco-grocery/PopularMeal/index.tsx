import { PopularMealsProps } from "../interfaces";
import { useState } from "react";
import { Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

export default function PopularMeal({ popularMeals, setSearchQuery }: PopularMealsProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Show only first few categories initially
  const initialDisplayCount = 6;
  const displayedCategories = showAll 
    ? popularMeals 
    : popularMeals.slice(0, initialDisplayCount);
  
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-darkgreen mb-4">
        Search by Food Categories
      </h2>
      <div className="flex flex-wrap gap-3">
        {displayedCategories.map((category, index) => (
          <div
            key={index}
            className="bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer !rounded-button whitespace-nowrap"
            onClick={() => setSearchQuery(category)}
          >
            {category}
          </div>
        ))}
      </div>
      
      {popularMeals.length > initialDisplayCount && (
        <Button
          variant="light"
          size="sm"
          className="mt-4 text-[#2F5233]"
          onPress={() => setShowAll(!showAll)}
        >
          {showAll 
            ? <>Show Less <FontAwesomeIcon icon={faChevronUp} className="ml-1" /></>
            : <>See More <FontAwesomeIcon icon={faChevronDown} className="ml-1" /></>
          }
        </Button>
      )}
    </div>
  );
} 