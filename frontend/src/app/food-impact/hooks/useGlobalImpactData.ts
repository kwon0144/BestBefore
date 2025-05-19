import { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '@/config';
import { GlobalWasteData, ApiYearlyResponse, YearlyCountryData, CountryYearlyData } from '../interfaces/GlobalImpact';

/**
 * Custom hook to fetch global food waste impact data
 * @param year - Year to fetch data for (default: 2024)
 * @returns Object containing global waste data, loading state, and error
 */
export const useGlobalImpactData = (year: number = 2024) => {
  const [wasteData, setWasteData] = useState<GlobalWasteData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usingCache, setUsingCache] = useState<boolean>(false);
  const [cacheTimestamp, setCacheTimestamp] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        const startTime = performance.now();
        
        const response = await axios.get<GlobalWasteData>(`${config.apiUrl}/api/economic-impact/`, {
          params: { year },
          timeout: 10000 // 10-second timeout
        });
        
        const endTime = performance.now();
        
        // Check if data came from cache
        if (response.data && response.data.cache !== undefined) {
          setUsingCache(response.data.cache);
          setCacheTimestamp(response.data.updated_at);
        }
        
        // Process data to include Taiwan as part of China
        if (response.data && response.data.countries) {
          const processedData = {...response.data};
          
          // Find Taiwan and China in the data
          const taiwanData = processedData.countries.find(c => c.country.toLowerCase() === 'taiwan');
          const chinaData = processedData.countries.find(c => c.country.toLowerCase() === 'china');
          
          // If both exist, merge Taiwan into China
          if (taiwanData && chinaData) {
            // Add Taiwan's data to China
            chinaData.total_waste = (chinaData.total_waste || 0) + (taiwanData.total_waste || 0);
            chinaData.total_economic_loss += taiwanData.total_economic_loss;
            
            // Remove Taiwan from the list
            processedData.countries = processedData.countries.filter(
              c => c.country.toLowerCase() !== 'taiwan'
            );
          }
          
          // Set the processed data
          setWasteData(processedData);
        } else {
          setWasteData(response.data);
        }
        
        setError(null);
      } catch (err: any) {
        // Set appropriate error message
        let errorMessage = 'Error loading data. Please check the API connection.';
        if (err.code === 'ECONNABORTED' || (err.message && err.message.includes('timeout'))) {
          errorMessage = 'Request timed out. The API server might be slow or unavailable.';
        } else if (err.response && err.response.status === 404) {
          errorMessage = 'API endpoint not found (404). Check that the server is properly configured.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  return { wasteData, loading, error, usingCache, cacheTimestamp };
};

/**
 * Custom hook to fetch yearly country data for trends
 * @returns Object containing yearly data by country and loading state
 */
export const useCountryYearlyData = () => {
  const [trendData, setTrendData] = useState<YearlyCountryData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchYearlyData = async () => {
      setLoading(true);
      
      try {
        const response = await axios.get<ApiYearlyResponse>(`${config.apiUrl}/api/country-yearly-waste/`);
        
        if (response.data && response.data.data) {
          // Convert API data to our YearlyCountryData format
          const apiData: YearlyCountryData = {};
          
          response.data.data.forEach((item: CountryYearlyData) => {
            if (!apiData[item.country]) {
              apiData[item.country] = {};
            }
            
            apiData[item.country][item.year] = {
              total_waste: item.total_waste,
              total_economic_loss: item.economic_loss,
              household_waste_percentage: item.household_waste_percentage
            };
          });
          
          setTrendData(apiData);
          setError(null);
        }
      } catch (err) {
        setError("Failed to load yearly trend data");
      } finally {
        setLoading(false);
      }
    };

    fetchYearlyData();
  }, []);

  /**
   * Function to fetch data for a specific country (on-demand)
   * @param countryName - Name of the country to fetch data for
   */
  const fetchCountryData = async (countryName: string) => {
    // Skip if we already have data for this country
    if (trendData[countryName] && Object.keys(trendData[countryName]).length > 0) {
      return;
    }
    
    try {
      const startTime = performance.now();
      
      // Filter API call to only get the selected country data
      const response = await axios.get<ApiYearlyResponse>(
        `${config.apiUrl}/api/country-yearly-waste/`,
        {
          params: { country: countryName },
          timeout: 8000 // 8-second timeout
        }
      );
      
      const endTime = performance.now();
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        // Format the data for this country
        const newTrendData = {...trendData};
        
        // Initialize the country entry if needed
        if (!newTrendData[countryName]) {
          newTrendData[countryName] = {};
        }
        
        // Add data for each year
        response.data.data.forEach((item: CountryYearlyData) => {
          newTrendData[countryName][item.year] = {
            total_waste: item.total_waste,
            total_economic_loss: item.economic_loss,
            household_waste_percentage: item.household_waste_percentage
          };
        });
        
        setTrendData(newTrendData);
        setError(null);
      }
    } catch (err) {
      setError(`Failed to load yearly data for ${countryName}`);
    }
  };

  return { trendData, loading, error, fetchCountryData };
}; 