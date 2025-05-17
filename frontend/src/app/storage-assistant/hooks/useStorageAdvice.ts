/**
 * Storage Advice Custom Hook
 * 
 * This hook provides functionality to fetch storage recommendations for food items
 * by making API calls to the backend storage advice service.
 * 
 * Features:
 * - Handles the API call to get storage advice for food items
 * - Manages loading and error states
 * - Normalizes different response formats (database vs Claude)
 * - Returns structured storage advice with fridge/pantry times
 */

import { useState } from "react";
import axios from "axios";
import { config } from "@/config";

// Define the response types from the API
export interface StorageAdviceResponse {
    method: string | number; // Can be a string ('fridge'/'pantry') or a number (1/2)
    fridge?: number;
    pantry?: number;
    days?: number;
    source?: string;
}

export interface NormalizedStorageAdvice {
    fridgeStorageTime: number;
    pantryStorageTime: number;
    recommendedMethod: 'fridge' | 'pantry';
    source?: string;
}

interface UseStorageAdviceReturn {
    getStorageAdvice: (foodType: string) => Promise<NormalizedStorageAdvice | null>;
    advice: NormalizedStorageAdvice | null;
    loading: boolean;
    error: string | null;
}

export function useStorageAdvice(): UseStorageAdviceReturn {
    const [advice, setAdvice] = useState<NormalizedStorageAdvice | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch storage advice for a specific food type
     * 
     * @param foodType - The type of food to get storage advice for
     * @returns Normalized storage advice or null if an error occurred
     */
    const getStorageAdvice = async (foodType: string): Promise<NormalizedStorageAdvice | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post<StorageAdviceResponse>(`${config.apiUrl}/api/storage-advice/`, {
                food_type: foodType
            });

            const recommendation = response.data;

            // Normalize the response format
            let fridgeStorageTime = 7; // Default fridge time
            let pantryStorageTime = 14; // Default pantry time
            let recommendedMethod: 'fridge' | 'pantry' = 'pantry'; // Default method

            // Extract storage times from the recommendation based on response format
            if (typeof recommendation.method === 'number') {
                // Database response format - method is a number (1=fridge, 2=pantry)
                recommendedMethod = recommendation.method === 1 ? 'fridge' : 'pantry';
                fridgeStorageTime = Number(recommendation.fridge) || fridgeStorageTime;
                pantryStorageTime = Number(recommendation.pantry) || pantryStorageTime;
            } else if (typeof recommendation.method === 'string') {
                // Claude response format - method is a string ('fridge' or 'pantry')
                recommendedMethod = recommendation.method as 'fridge' | 'pantry';
                // Claude might only provide one storage time in the 'days' field
                const providedDays = Number(recommendation.days) || 7;
                if (recommendedMethod === 'fridge') {
                    fridgeStorageTime = providedDays;
                } else {
                    pantryStorageTime = providedDays;
                }
            }

            const normalizedAdvice: NormalizedStorageAdvice = {
                fridgeStorageTime,
                pantryStorageTime,
                recommendedMethod,
                source: recommendation.source
            };

            setAdvice(normalizedAdvice);
            return normalizedAdvice;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get storage advice';
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        getStorageAdvice,
        advice,
        loading,
        error
    };
} 