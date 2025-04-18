import { PopularMealsProps } from "../interfaces";

export default function PopularMeal({ popularMeals, setSearchQuery }: PopularMealsProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Popular Meals</h2>
      <div className="flex overflow-x-auto pb-4 gap-4">
        {popularMeals.map((meal, index) => (
          <div
            key={index}
            className="bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer min-w-max !rounded-button whitespace-nowrap"
            onClick={() => setSearchQuery(meal)}
          >
            {meal}
          </div>
        ))}
      </div>
    </div>
  );
} 