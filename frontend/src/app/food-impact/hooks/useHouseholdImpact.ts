import { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '@/config';

export interface HouseholdImpactData {
  overall: {
    latest_year: number;
    waste_per_capita: number;
    household_waste_percentage: number;
    country: string;
    population: number;
  };
  yearly_data: {
    year: number;
    waste_per_capita: number;
    total_waste: number;
    economic_loss: number;
    population: number;
    household_waste_percentage: number;
    annual_cost_per_household: number;
    household_waste_tons: number;
  }[];
  potential_savings: {
    reduction_50_percent: number;
    reduction_25_percent: number;
  };
  updated_at: string;
}

/**
 * Custom hook to fetch household impact data related to food waste
 * @param country - Country to fetch data for (default: 'Australia')
 * @returns Object containing impact data, current year data, and loading state
 */
export const useHouseholdImpact = (country: string = 'Australia') => {
  const [impactData, setImpactData] = useState<HouseholdImpactData | null>(null);
  const [currentYearData, setCurrentYearData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${config.apiUrl}/api/household-impact/?country=${country}`;
        const response = await axios.get<HouseholdImpactData>(apiUrl);
        setImpactData(response.data);
        
        // Find 2024 data or latest year data if 2024 isn't available
        const data2024 = response.data.yearly_data.find(d => d.year === 2024) || 
                         response.data.yearly_data.find(d => d.year === response.data.overall.latest_year) || 
                         response.data.yearly_data[response.data.yearly_data.length - 1];
        
        setCurrentYearData(data2024);
        setError(null);
      } catch (error) {
        console.error("Error fetching household impact data:", error);
        setError("Failed to load household impact data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [country]);

  return { impactData, currentYearData, loading, error };
}; 