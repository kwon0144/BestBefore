import { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '@/config';
import { FoodWasteCompositionResponse, FoodWasteItem } from '../interfaces/FoodWaste';

/**
 * Custom hook to fetch food waste composition data used in the supply chain visualization
 * @returns Object containing waste data, total amount in tonnes, and loading state
 */
export const useWasteComposition = () => {
  const [wasteData, setWasteData] = useState<FoodWasteItem[]>([]);
  const [totalTonnes, setTotalTonnes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${config.apiUrl}/api/waste-composition/`;
        const response = await axios.get<FoodWasteCompositionResponse>(apiUrl);
        setWasteData(response.data.data);
        setTotalTonnes(response.data.total_tonnes);
        setError(null);
      } catch (error) {
        console.error("Error fetching waste composition data:", error);
        setError("Failed to load waste composition data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { wasteData, totalTonnes, loading, error };
}; 