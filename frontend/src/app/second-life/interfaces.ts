/**
 * This file contains all interfaces used in the Second Life feature, which helps users discover
 * how to repurpose food waste into useful products.
 */

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/**
 * Interface for items from the diy_projects database
 * @interface
 */
export interface SecondLifeItem {
    method_id: number;
    method_name: string;
    is_combo: boolean;
    method_category: string;
    ingredient: string;
    description: string;
    picture: string;
}

/**
 * Props for the Search component
 * @interface
 */
export interface SearchProps {
    setSearchQuery: (query: string) => void;
    setSelectedIngredient: (ingredient: string | null) => void;
    inputValue: string;
    setInputValue: (value: string) => void;
}

/**
 * Props for the Ingredients component
 * @interface
 */
export interface IngredientsProps {
    ingredients: string[];
    selectedIngredient: string | null;
    handleIngredientSelect: (ingredient: string) => void;
}

/**
 * Props for the Categories component
 * @interface
 */
export interface CategoriesProps {
    categories: Array<{ name: string; icon: IconDefinition }>;
    selectedCategory: string | null;
    handleCategorySelect: (category: string) => void;
}

/**
 * Props for the ItemsGrid component
 * @interface
 */
export interface ItemsGridProps {
    items: SecondLifeItem[];
    allItems: SecondLifeItem[];
    filteredItemsCount: number;
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    handleCardClick: (item: SecondLifeItem) => void;
    handlePageChange: (page: number) => void;
}

/**
 * Props for the ItemDetail component
 * @interface
 */
export interface ItemDetailProps {
    isOpen: boolean;
    onClose: () => void;
    item: SecondLifeItem | null;
} 