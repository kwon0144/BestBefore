import { useState, useEffect } from 'react';
import { FoodWasteCompositionResponse, FoodWasteByCategoryResponse } from '../interfaces/FoodWaste';
import { config } from '@/config';
import axios from 'axios';

/**
 * Custom hook that fetches food waste data for visualization
 * 
 * @param countryName - Country name (default: 'Australia')
 * @param year - Year to get data for (default: current year)
 * @returns Object containing composition and category data, loading state, and any errors
 */
export const useFoodWasteData = (countryName: string = 'Australia', year: string = new Date().getFullYear().toString()) => {
    const [compositionData, setCompositionData] = useState<FoodWasteCompositionResponse | null>(null);
    const [categoryData, setCategoryData] = useState<FoodWasteByCategoryResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                console.log(`Fetching food waste data for ${countryName}, year: ${year}`);
                
                // First API call: food waste by category with country and year params
                const categoryPromise = axios.get<FoodWasteByCategoryResponse>(
                    `${config.apiUrl}/api/food-waste-by-category/`, 
                    { params: { country: countryName, year: year } }
                );
                
                // Second API call: also use food-waste-by-category for composition data
                // We'll transform this data to fit the composition format
                const compositionPromise = axios.get<FoodWasteByCategoryResponse>(
                    `${config.apiUrl}/api/food-waste-by-category/`, 
                    { params: { country: countryName, year: year } }
                );
                
                // Use Promise.allSettled to continue even if one endpoint fails
                const [categoryResult, compositionResult] = await Promise.allSettled([
                    categoryPromise,
                    compositionPromise
                ]);
                
                // Process category data (sectors)
                if (categoryResult.status === 'fulfilled') {
                    setCategoryData(categoryResult.value.data);
                } else {
                    console.warn("Could not fetch food waste categories:", categoryResult.reason);
                    setError(`Failed to load category data: ${categoryResult.reason}`);
                }
                
                // Process composition data (food types)
                // Transform from the category format to the composition format
                if (compositionResult.status === 'fulfilled') {
                    // Convert the data format from categories to composition format
                    const transformedData: FoodWasteCompositionResponse = {
                        total_tonnes: compositionResult.value.data.total_waste,
                        data: compositionResult.value.data.categories.map(category => ({
                            name: category.category,
                            value: category.total_waste,
                            percentage: category.percentage,
                            color: getColorForFoodCategory(category.category)
                        })),
                        updated_at: compositionResult.value.data.updated_at
                    };
                    setCompositionData(transformedData);
                } else {
                    console.warn("Could not fetch food composition data:", compositionResult.reason);
                    if (!error) { // Don't overwrite category error if it exists
                        setError(`Failed to load composition data: ${compositionResult.reason}`);
                    }
                }
                
                // If both requests failed, set a combined error
                if (compositionResult.status === 'rejected' && categoryResult.status === 'rejected') {
                    setError("Could not reach food waste data API. Please check your connection or try again later.");
                }
            } catch (err) {
                console.error("Error fetching food waste data:", err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [countryName, year]);

    return { compositionData, categoryData, loading, error };
};

/**
 * Helper function to assign consistent colors to food categories
 */
function getColorForFoodCategory(category: string): string {
    const categoryColors: {[key: string]: string} = {
        "Fruits & Vegetables": "#22c55e",
        "Meat & Dairy": "#ef4444",
        "Bakery": "#eab308",
        "Prepared Foods": "#3b82f6",
        "Cereals": "#a855f7",
        "Seafood": "#06b6d4",
        "Household": "#3b82f6",
        "Food Service": "#22c55e",
        "Retail": "#eab308",
        "Agriculture": "#ef4444",
        "Manufacturing": "#a855f7",
        "Other": "#ec4899"
    };
    
    // Try to match the category against our predefined colors
    for (const [key, color] of Object.entries(categoryColors)) {
        if (category.toLowerCase().includes(key.toLowerCase())) {
            return color;
        }
    }
    
    // Default color if no match found
    return "#6b7280";
} 