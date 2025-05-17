/**
 * Second Life Items Custom Hook
 * 
 * This hook provides functionality for fetching and managing Second Life items from the backend API.
 * It handles loading states, error handling with specific error messages based on status codes,
 * and pagination calculations.
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { SecondLifeItem } from '@/app/second-life/interfaces/SecondLifeItem';
import { config } from '@/config';

interface UseSecondLifeItemsProps {
    itemsPerPage: number;
    initialSearchQuery?: string;
    initialIngredient?: string;
}

interface UseSecondLifeItemsResult {
    items: SecondLifeItem[];
    loading: boolean;
    error: string | null;
    totalPages: number;
    fetchItems: (searchQuery?: string, selectedIngredient?: string) => Promise<void>;
}

/**
 * Hook for fetching and managing Second Life items
 * 
 * @param apiUrl - The base URL for the API
 * @param itemsPerPage - Number of items to show per page for pagination calculations
 * @param initialSearchQuery - Initial search query (optional)
 * @param initialIngredient - Initial selected ingredient (optional)
 * @returns Object containing items, loading state, error state, total pages, and fetch function
 */
export function useSecondLifeItems({
    itemsPerPage,
    initialSearchQuery = '',
    initialIngredient = ''
}: UseSecondLifeItemsProps): UseSecondLifeItemsResult {
    const [items, setItems] = useState<SecondLifeItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [currentSearchQuery, setCurrentSearchQuery] = useState<string>(initialSearchQuery);
    const [currentIngredient, setCurrentIngredient] = useState<string>(initialIngredient);

    // Fetch items from the backend API based on search criteria
    const fetchItems = useCallback(async (
        searchQuery?: string,
        selectedIngredient?: string
    ) => {
        const queryToUse = searchQuery !== undefined ? searchQuery : currentSearchQuery;
        const ingredientToUse = selectedIngredient !== undefined ? selectedIngredient : currentIngredient;

        // Update the current search parameters
        if (searchQuery !== undefined) setCurrentSearchQuery(searchQuery);
        if (selectedIngredient !== undefined) setCurrentIngredient(selectedIngredient);

        try {
            setLoading(true);
            const response = await axios.get<SecondLifeItem[]>(`${config.apiUrl}/api/second-life/`, {
                params: {
                    search: queryToUse || ingredientToUse
                }
            });
            setItems(response.data);
            setTotalPages(Math.ceil(response.data.length / itemsPerPage));
            setError(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                const axiosError = err as { response?: { status: number } };
                if (axiosError.response?.status) {
                    const status = axiosError.response.status;
                    if (status === 429) {
                        setError('Too many requests. Please wait a moment and try again.');
                    } else if (status === 404) {
                        setError('No items found matching your search.');
                    } else if (status >= 500) {
                        setError('Server error. Please try again later.');
                    } else {
                        setError('Failed to fetch items. Please try again.');
                    }
                } else {
                    setError('An unexpected error occurred. Please try again.');
                }
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
        }
    }, [currentSearchQuery, currentIngredient, itemsPerPage, config.apiUrl]);

    // Fetch items on initial render or when dependencies change
    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    return {
        items,
        loading,
        error,
        totalPages,
        fetchItems
    };
} 