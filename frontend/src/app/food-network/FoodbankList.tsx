'use client';

import React, { useState, useEffect } from 'react';
import { Input } from './(components)/ui/input';
interface Foodbank {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  hours_of_operation: string;
  address: string;
  operation_schedule: {
    is_24_hours: boolean;
    days: string[];
    hours: string | null;
    raw_text: string;
  };
}

interface FoodbankListProps {
  onSelectFoodbank?: (foodbank: Foodbank) => void;
}

const FoodbankList: React.FC<FoodbankListProps> = ({ onSelectFoodbank }) => {
  const [foodbanks, setFoodbanks] = useState<Foodbank[]>([]);
  const [filteredFoodbanks, setFilteredFoodbanks] = useState<Foodbank[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFoodbanks = async () => {
      try {
        const response = await fetch('/api/foodbanks');
        if (!response.ok) {
          throw new Error('Failed to fetch foodbanks');
        }
        const data = await response.json();
        
        if (data.status === 'success' && Array.isArray(data.data)) {
          console.log('Foodbank data sample:', data.data[0]); // Debug to see the structure
          
          // Map the API data to ensure address exists (it might be named differently)
          const processedData = data.data.map((item: any) => {
            // Check if address exists, or use location data or coordinates as fallback
            const address = item.address || 
                           item.location_address || 
                           item.street_address || 
                           `Coordinates: ${item.latitude}, ${item.longitude}`;
            
            return {
              ...item,
              address: address
            };
          });
          
          setFoodbanks(processedData);
          setFilteredFoodbanks(processedData);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching foodbanks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodbanks();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFoodbanks(foodbanks);
    } else {
      const filtered = foodbanks.filter(foodbank => 
        foodbank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (foodbank.address && foodbank.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredFoodbanks(filtered);
    }
  }, [searchTerm, foodbanks]);

  if (loading) {
    return <div className="p-4">Loading foodbanks...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Foodbanks in Melbourne</h2>
        <Input
          type="text"
          placeholder="Search by name or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {filteredFoodbanks.length === 0 ? (
        <div className="text-center p-2">
          No foodbanks found matching your search.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left py-2 px-3">Name</th>
              <th className="text-left py-2 px-3">Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredFoodbanks.map((foodbank) => (
              <tr 
                key={foodbank.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectFoodbank && onSelectFoodbank(foodbank)}
              >
                <td className="py-2 px-3 font-medium">{foodbank.name}</td>
                <td className="py-2 px-3 text-gray-600">
                  {foodbank.address || "No address available"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FoodbankList;