/**
 * This file contains all interfaces used in the Eco Grocery feature, which helps users create
 * efficient shopping lists based on meal choices and pantry availability to reduce food waste.
 */

/**
 * Interface for meal choices displayed to users for selection
 * @interface
 */
export interface MealChoice {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  cuisine?: string;
}

/**
 * Interface for signature dishes retrieved from the API
 * @interface
 */
export interface SignatureDish {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  cuisine: string;
}

/**
 * Interface for grocery items in the shopping list
 * @interface
 */
export interface GroceryItem {
  name: string;
  quantity: string;
  category: string;
}

/**
 * Interface for selected meals in the planner
 * @interface
 */
export interface Meal {
  id: number;
  name: string;
  quantity: number;
}

/**
 * Interface for pantry items available in user's inventory
 * @interface
 */
export interface PantryItem {
  name: string;
  quantity: string;
}

/**
 * Interface for the grocery list API response structure
 * @interface
 */
export interface GroceryListResponse {
  success: boolean;
  dishes?: string[];
  items_by_category?: Record<string, GroceryItem[]>;
  pantry_items?: Array<PantryItem>;
  error?: string;
}

/**
 * Props for the SearchBar component
 * @interface
 */
export interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addSearchResultMeal: () => void;
  handleSearchKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Props for the PopularMeals component
 * @interface
 */
export interface PopularMealsProps {
  popularMeals: string[];
  setSearchQuery: (cuisine: string) => void;
}

/**
 * Props for the MealChoices component
 * @interface
 */
export interface MealChoicesProps {
  mealChoices?: MealChoice[];
  filteredMealChoices: MealChoice[];
  addMeal: (meal: { id: number; name: string }) => void;
  isLoading?: boolean;
  selectedCuisine?: string | null;
}

/**
 * Props for the SelectedMeals component
 * @interface
 */
export interface SelectedMealsProps {
  selectedMeals: Meal[];
  adjustQuantity: (id: number, change: number) => void;
  removeMeal: (id: number) => void;
}

/**
 * Props for the GroceryList component
 * @interface
 */
export interface GroceryListProps {
  selectedMeals: Meal[];
  groceryItems: GroceryItem[];
  pantryItems: PantryItem[];
  loading: boolean;
  error: string | null;
  groceryList: GroceryListResponse | null;
  generateGroceryList: () => void;
  getGroceryItemsByCategory: (category: string) => GroceryItem[];
} 