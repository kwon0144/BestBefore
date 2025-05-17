import { useState, useEffect } from 'react';
import { FoodWasteCompositionResponse, FoodWasteByCategoryResponse } from '../interfaces/FoodWaste';
import { config } from '@/config';
import axios from 'axios';

// Mock data to use as fallback when API fails
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

export const useFoodWasteData = (countryCode: string = 'au') => {
    const [compositionData, setCompositionData] = useState<FoodWasteCompositionResponse | null>(null);
    const [categoryData, setCategoryData] = useState<FoodWasteByCategoryResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                console.log("Fetching food waste data from API:", `${config.apiUrl}/api/food-waste/composition`);
                
                // Use axios with the config.apiUrl
                const compositionPromise = axios.get<FoodWasteCompositionResponse>(
                    `${config.apiUrl}/api/food-waste/composition`, 
                    { params: { country: countryCode } }
                );
                
                const categoryPromise = axios.get<FoodWasteByCategoryResponse>(
                    `${config.apiUrl}/api/food-waste/categories`, 
                    { params: { country: countryCode } }
                );
                
                // Use Promise.allSettled to handle partial failures
                const [compositionResult, categoryResult] = await Promise.allSettled([
                    compositionPromise,
                    categoryPromise
                ]);
                
                // Handle composition data
                if (compositionResult.status === 'fulfilled') {
                    setCompositionData(compositionResult.value.data);
                } else {
                    console.warn("Failed to fetch composition data, using mock data:", compositionResult.reason);
                    setCompositionData(mockCompositionData);
                }
                
                // Handle category data
                if (categoryResult.status === 'fulfilled') {
                    setCategoryData(categoryResult.value.data);
                } else {
                    console.warn("Failed to fetch category data, using mock data:", categoryResult.reason);
                    setCategoryData(mockCategoryData);
                }
                
                // Set error if both failed
                if (compositionResult.status === 'rejected' && categoryResult.status === 'rejected') {
                    setError("Failed to fetch food waste data from API. Using mock data instead.");
                } else {
                    setError(null);
                }
            } catch (err) {
                console.error("Error in food waste data fetching:", err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
                
                // Use mock data as fallback
                setCompositionData(mockCompositionData);
                setCategoryData(mockCategoryData);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [countryCode]);

    return { compositionData, categoryData, loading, error };
}; 