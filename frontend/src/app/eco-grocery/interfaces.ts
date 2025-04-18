// Interface for meal choices
export interface MealChoice {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

// Interface for grocery items
export interface GroceryItem {
  name: string;
  quantity: string;
  category: string;
}

// Interface for meal
export interface Meal {
  id: number;
  name: string;
  quantity: number;
}

// Interface for Pantry items in the grocery list
export interface PantryItem {
  name: string;
  quantity: string;
}

// Interface for grocery list API response
export interface GroceryListResponse {
  success: boolean;
  dishes?: string[];
  items_by_category?: Record<string, any[]>;
  pantry_items?: Array<PantryItem>;
  error?: string;
}

// Props interfaces for components
export interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addSearchResultMeal: () => void;
  handleSearchKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export interface PopularMealsProps {
  popularMeals: string[];
  setSearchQuery: (query: string) => void;
}

export interface MealChoicesProps {
  mealChoices: MealChoice[];
  filteredMealChoices: MealChoice[];
  addMeal: (meal: { id: number; name: string }) => void;
}

export interface SelectedMealsProps {
  selectedMeals: Meal[];
  adjustQuantity: (id: number, change: number) => void;
  removeMeal: (id: number) => void;
}

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