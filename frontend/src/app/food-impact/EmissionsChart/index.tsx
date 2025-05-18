/**
 * EmissionsChart Component
 * 
 * Visualizes the top 5 food items that produce the most greenhouse gas emissions
 * per kilogram of food waste. Uses animated horizontal bars to display the relative
 * emissions with color-coded visualization to enhance data comprehension.
 * 
 * @component
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useEmissionsData, EmissionData } from '../hooks';

/**
 * Props for the EmissionsChart component
 * 
 * @interface EmissionsChartProps
 * @property {function} [setRef] - Optional function to set the ref of this component for scrolling/visibility tracking
 */
interface EmissionsChartProps {
  setRef?: (node: any) => void;
}

/**
 * EmissionsChart displays a horizontal bar chart showing greenhouse gas emissions
 * for different food types. Features animated bars that grow from left to right
 * when the component enters the viewport.
 * 
 * @param {EmissionsChartProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const EmissionsChart: React.FC<EmissionsChartProps> = ({ setRef }) => {
  // Fetch emissions data using custom hook
  const { emissionsData, loading, error } = useEmissionsData();

  // Loading state
  if (loading) {
    return (
      <div className="bg-green-50 py-10 md:py-16 px-4 lg:px-0 flex justify-center items-center h-[400px]" ref={setRef}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-green-50 py-10 md:py-16 px-4 lg:px-0 flex justify-center items-center h-[400px]" ref={setRef}>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 py-10 md:pb-20 px-4 lg:px-0" ref={setRef}>
      <div className="max-w-6xl mx-auto">
        {/* Section title */}
        <h2 className="text-3xl md:text-5xl font-bold text-darkgreen mb-3 md:mb-4">
          Top 5 Greenhouse Gas Emissions Food Items{" "}
        </h2>
        <h2 className="text-2xl md:text-4xl font-bold text-darkgreen mb-6 md:mb-8">
          per kilogram of food waste <sup className="text-sm align-super ml-1">4</sup>
        </h2>
        
        {/* Chart container with staggered animation for children */}
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
          {/* Mapping through data to render individual chart bars */}
          {emissionsData.map((item, index) => (
            <div className="relative mb-3" key={index}>
              {/* Animated bar with width based on percentage */}
              <motion.div 
                className="p-2 md:p-3 h-8 md:h-12" 
                style={{ 
                  backgroundColor: item.color || "#2D6A4F", 
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
              
              {/* Food type and value labels that appear after bar animation */}
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