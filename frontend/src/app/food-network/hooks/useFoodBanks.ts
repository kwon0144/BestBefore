/**
 * Foodbank Custom Hooks
 * 
 * This file provides React hooks for fetching and managing foodbank data from the backend API.
 * These hooks abstract away the data fetching logic, providing components with clean interfaces
 * to access foodbank data while handling loading states and errors.
 * 
 * The hooks fetch data directly from the backend API rather than via Next.js API routes,
 * using the environment variable NEXT_PUBLIC_API_URL or falling back to localhost:8000.
 */

import { useState, useEffect } from "react";
import axios from "axios";
import { Foodbank, FoodbankResponse } from "@/app/food-network/interfaces/Foodbank";

/**
 * Hook to fetch all foodbanks
 * 
 * Provides a list of all foodbanks with loading and error states.
 * Used for displaying lists, maps, and other components that need the full dataset.
 * 
 * @returns Object containing:
 *   - foodbanks: Array of Foodbank objects
 *   - loading: Boolean indicating if data is being fetched
 *   - error: Error message or null if no error
 */
export function useFoodBanks(): {
    foodbanks: Foodbank[];
    loading: boolean;
    error: string | null;
} {
    const [foodbanks, setFoodbanks] = useState<Foodbank[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFoodbanks = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await axios.get<FoodbankResponse>(`${backendUrl}/api/foodbanks/`);
                setFoodbanks(response.data.data);
            } catch (error) {
                setError(`Error fetching foodbanks: ${error}`);
            } finally {
                setLoading(false);
            }
        };

        fetchFoodbanks();
    }, []);

    return { foodbanks, loading, error };
}

/**
 * Hook to fetch a single foodbank by ID
 * 
 * Provides data for a specific foodbank based on the provided ID.
 * Used for detail views, information panels, and navigation purposes.
 * 
 * @param selectedEnd - String ID of the foodbank to fetch, or null if no selection
 * @returns Object containing:
 *   - foodbank: The found Foodbank object or null if not found/no selection
 *   - loading: Boolean indicating if data is being fetched
 *   - error: Error message or null if no error
 */
export function useFoodBankById(selectedEnd: string | null): {
    foodbank: Foodbank | null;
    loading: boolean;
    error: string | null
} {
    const [foodbank, setFoodbank] = useState<Foodbank | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFoodbank = async () => {
            if (!selectedEnd) {
                setFoodbank(null);
                setLoading(false);
                return;
            }

            try {
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await axios.get<FoodbankResponse>(`${backendUrl}/api/foodbanks/`);

                // Find the foodbank with matching ID
                const selectedFoodbank = response.data.data.find(
                    (bank: Foodbank) => bank.id === parseInt(selectedEnd)
                );
                setFoodbank(selectedFoodbank || null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchFoodbank();
    }, [selectedEnd]);

    return { foodbank, loading, error };
}