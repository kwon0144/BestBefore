/**
 * Meal Choice Interfaces
 * 
 * This file defines the types and interfaces related to meal choices and signature dishes
 * used in the EcoGrocery feature. These interfaces handle the meal selection aspect of
 * the grocery planning process.
 */

/**
 * Interface for meal choices displayed to users for selection
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
 */
export interface SignatureDish {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    cuisine: string;
}

/**
 * Props for the SearchBar component
 */
export interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    addSearchResultMeal: () => void;
    handleSearchKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    filteredResults: (MealChoice | SignatureDish)[];
    onSelectMeal: (meal: MealChoice | SignatureDish) => void;
}

/**
 * Props for the PopularMeals component
 */
export interface PopularMealsProps {
    popularMeals: string[];
    setSearchQuery: (cuisine: string) => void;
}

/**
 * Props for the MealChoices component
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
 */
export interface SelectedMealsProps {
    selectedMeals: Meal[];
    adjustQuantity: (id: number, change: number) => void;
    removeMeal: (id: number) => void;
}

/**
 * Props for the SelectedMeal component with generate button
 */
export interface SelectedMealWithButtonProps {
    selectedMeals: Meal[];
    adjustQuantity: (id: number, change: number) => void;
    removeMeal: (id: number) => void;
    onGenerate: () => void;
    loading: boolean;
}

/**
 * Interface for selected meals in the planner
 */
export interface Meal {
    id: number;
    name: string;
    quantity: number;
} 