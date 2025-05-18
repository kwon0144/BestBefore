import { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '@/config';

export interface EmissionData {
  food_type: string;
  ghg: number;
  percentage?: number;
  color?: string;
}

/**
 * Custom hook to fetch and process food emissions data
 * @returns Object containing emissions data, loading state, and any errors
 */
export const useEmissionsData = () => {
  const [emissionsData, setEmissionsData] = useState<EmissionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmissionsData = async () => {
      try {
        const response = await axios.get<EmissionData[]>(`${config.apiUrl}/api/food-emissions/`);
        
        // Sort data by greenhouse gas emissions (highest first)
        const sortedData = [...response.data].sort((a, b) => b.ghg - a.ghg);
        
        // Take top 5 entries
        const top5Data = sortedData.slice(0, 5);
        
        // Calculate percentages relative to the highest value
        const highestValue = top5Data[0].ghg;
        const dataWithPercentages = top5Data.map((item, index) => ({
          ...item,
          percentage: Math.round((item.ghg / highestValue) * 80),
          color: getColor(index) // Assign color based on index
        }));
        
        setEmissionsData(dataWithPercentages);
      } catch (err) {
        console.error("Error fetching emissions data:", err);
        setError("Failed to load emissions data");
      } finally {
        setLoading(false);
      }
    };

    fetchEmissionsData();
  }, []);

  // Function to get colors based on index
  const getColor = (index: number): string => {
    const colors = ["#2D6A4F", "#40916C", "#52B788", "#74C69D", "#B7E4C7"];
    return colors[index] || colors[0];
  };

  return { emissionsData, loading, error };
}; 