/**
 * Signature Dishes Custom Hook
 * 
 * This hook provides functionality for fetching signature dishes from the backend API
 * based on a selected cuisine. It handles loading states and error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Import the SignatureDish interface from the specific interface file
import { SignatureDish } from '@/app/eco-grocery/interfaces/MealChoice';

interface UseSignatureDishesProps {
    initialCuisine?: string | null;
}

interface UseSignatureDishesResult {
    signatureDishes: SignatureDish[];
    loading: boolean;
    error: string | null;
    fetchDishes: (cuisine: string | null) => Promise<void>;
}

/**
 * Hook for fetching signature dishes based on cuisine
 * 
 * @param apiUrl - The base URL for the API
 * @param initialCuisine - Initial selected cuisine (optional)
 * @returns Object containing signature dishes, loading state, error state, and fetch function
 */
export function useSignatureDishes({
    initialCuisine = null
}: UseSignatureDishesProps): UseSignatureDishesResult {
    const [signatureDishes, setSignatureDishes] = useState<SignatureDish[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentCuisine, setCurrentCuisine] = useState<string | null>(initialCuisine);

    /**
     * Fetch signature dishes from the API based on selected cuisine
     */
    const fetchDishes = useCallback(async (cuisine: string | null) => {
        // If cuisine is null, just clear dishes and return
        if (!cuisine) {
            setSignatureDishes([]);
            setCurrentCuisine(null);
            return;
        }

        // Update the current cuisine
        setCurrentCuisine(cuisine);

        setLoading(true);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const endpoint = `${backendUrl}/api/signature-dishes/`;

            const response = await axios.get<SignatureDish[]>(endpoint, {
                params: { cuisine }
            });

            setSignatureDishes(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching signature dishes:', error);
            setSignatureDishes([]);
            setError('Failed to fetch signature dishes');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch dishes when the current cuisine changes
    useEffect(() => {
        if (currentCuisine) {
            fetchDishes(currentCuisine);
        }
    }, [currentCuisine, fetchDishes]);

    return {
        signatureDishes,
        loading,
        error,
        fetchDishes
    };
} 