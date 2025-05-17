/**
 * Second Life Items Interfaces
 * 
 * This file defines the types and interfaces related to the Second Life feature, which helps users
 * discover how to repurpose food waste into useful products.
 * 
 * These interfaces are used throughout the application to ensure type safety and provide
 * consistent data structures for components handling Second Life items.
 */

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/**
 * Interface for items from the diy_projects database
 * Represents a single DIY project or method for repurposing food waste
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
 * API response format for Second Life items
 * Used when fetching Second Life data from the backend
 */
export interface SecondLifeItemsResponse {
    status: string;
    count: number;
    data: SecondLifeItem[];
}

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
 * Props for the Ingredients component
 * Used to display and manage ingredient quick filters
 */
export interface IngredientsProps {
    ingredients: string[];
    selectedIngredient: string | null;
    handleIngredientSelect: (ingredient: string) => void;
}

/**
 * Props for the Categories component
 * Used to display and manage category filters
 */
export interface CategoriesProps {
    categories: Array<{ name: string; icon: IconDefinition }>;
    selectedCategory: string | null;
    handleCategorySelect: (category: string) => void;
}

/**
 * Props for the ItemsGrid component
 * Used to display grid of Second Life items with pagination
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
 * Used to display detailed information about a Second Life item
 */
export interface ItemDetailProps {
    isOpen: boolean;
    onClose: () => void;
    item: SecondLifeItem | null;
} 