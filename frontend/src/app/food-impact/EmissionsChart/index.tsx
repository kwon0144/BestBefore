import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { config } from '@/config';

interface EmissionData {
  food_type: string;
  ghg: number;
  percentage?: number;
  color?: string;
}

const EmissionsChart: React.FC = () => {
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

  // Loading state
  if (loading) {
    return (
      <div className="bg-green-50 py-10 md:py-16 px-4 lg:px-0 flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-green-50 py-10 md:py-16 px-4 lg:px-0 flex justify-center items-center h-[400px]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 py-10 md:py-16 px-4 lg:px-0">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-darkgreen mb-3 md:mb-4">
          Top 5 Greenhouse Gas Emissions Food Items{" "}
        </h2>
        <h2 className="text-2xl md:text-4xl font-bold text-darkgreen mb-6 md:mb-8">
          per kilogram of food waste <sup className="text-sm align-super ml-1">4</sup>
        </h2>
        
        {/* Chart container with animation */}
        <motion.div 
          className="relative pt-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={{
            visible: {
              transition: { staggerChildren: 0.2 }
            },
            hidden: {
              transition: { staggerChildren: 0.05, staggerDirection: -1 }
            }
          }}
        >
          {/* Rendering chart bars */}
          {emissionsData.map((item, index) => (
            <div className="relative mb-3" key={index}>
              <motion.div 
                className="p-2 md:p-3 h-8 md:h-12" 
                style={{ 
                  backgroundColor: item.color || getColor(index), 
                  originX: 0
                }}
                variants={{
                  visible: { 
                    width: `${item.percentage || 0}%`,
                    transition: { 
                      duration: 0.8,
                      ease: "easeOut"
                    }
                  },
                  hidden: { 
                    width: "0%",
                    transition: {
                      duration: 0.5,
                      ease: "easeIn"
                    }
                  }
                }}
              ></motion.div>
              <motion.div 
                className="absolute top-0 text-darkgreen flex flex-col pl-2"
                variants={{
                  visible: { 
                    opacity: 1,
                    x: 0,
                    transition: { 
                      duration: 0.5,
                      delay: 0.3
                    }
                  },
                  hidden: { 
                    opacity: 0,
                    x: -20,
                    transition: {
                      duration: 0.3
                    }
                  }
                }}
                style={{ left: `${item.percentage || 0}%` }}
              >
                <span className="mr-2 font-bold text-xs md:text-base">{item.food_type}</span>
                <span className="text-xs md:text-base">{item.ghg.toFixed(1)}</span>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default EmissionsChart; 