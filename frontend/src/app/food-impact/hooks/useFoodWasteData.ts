import { useState, useEffect } from 'react';
import { FoodWasteCompositionResponse, FoodWasteByCategoryResponse } from '../interfaces/FoodWaste';
import { config } from '@/config';
import axios from 'axios';

/**
 * Fallback data for food waste composition when API isn't available
 * This represents the breakdown of food waste by food type (fruits, meat, etc.)
 */
const mockCompositionData: FoodWasteCompositionResponse = {
    total_tonnes: 7600000,
    data: [
        { name: "Fruits & Vegetables", value: 2736000, percentage: 36, color: "#22c55e" },
        { name: "Bakery", value: 1368000, percentage: 18, color: "#eab308" },
        { name: "Meat & Dairy", value: 1976000, percentage: 26, color: "#ef4444" },
        { name: "Prepared Foods", value: 912000, percentage: 12, color: "#3b82f6" },
        { name: "Other", value: 608000, percentage: 8, color: "#a855f7" }
    ],
    updated_at: new Date().toISOString()
};

/**
 * Fallback data for food waste by sector when API isn't available
 * This shows how food waste is distributed across different sectors like
 * households, restaurants, retail stores, etc.
 */
const mockCategoryData: FoodWasteByCategoryResponse = {
    total_waste: 7600000,
    categories: [
        { category: "Household", total_waste: 4004800, economic_loss: 10800000000, percentage: 52.7, color: "#3b82f6" },
        { category: "Food Service", total_waste: 1368000, economic_loss: 8900000000, percentage: 18, color: "#22c55e" },
        { category: "Retail", total_waste: 1064000, economic_loss: 7600000000, percentage: 14, color: "#eab308" },
        { category: "Agriculture", total_waste: 608000, economic_loss: 5320000000, percentage: 8, color: "#ef4444" },
        { category: "Manufacturing", total_waste: 555200, economic_loss: 3980000000, percentage: 7.3, color: "#a855f7" }
    ],
    filters: {
        year: "2024",
        country: "Australia"
    },
    updated_at: new Date().toISOString()
};

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
                    console.warn("Could not fetch food waste categories, using fallback data:", categoryResult.reason);
                    setCategoryData(mockCategoryData);
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
                    console.warn("Could not fetch food composition data, using fallback data:", compositionResult.reason);
                    setCompositionData(mockCompositionData);
                }
                
                // Only show an error if both requests failed
                if (compositionResult.status === 'rejected' && categoryResult.status === 'rejected') {
                    setError("Could not reach food waste data API. Using backup data instead.");
                } else {
                    setError(null);
                }
            } catch (err) {
                console.error("Error fetching food waste data:", err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
                
                // Use backup data if something went wrong
                setCompositionData(mockCompositionData);
                setCategoryData(mockCategoryData);
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