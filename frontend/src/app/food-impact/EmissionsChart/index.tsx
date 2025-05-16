import React from 'react';
import { motion } from 'framer-motion';
import { CardInfo } from '../interfaces';

const EmissionsChart: React.FC = () => {
  // Emissions data
  const emissionsData: CardInfo[] = [
    { country: "Australia", value: 2213.1, percentage: 100, color: "#2D6A4F" },
    { country: "Indonesia", value: 1200.2, percentage: 55, color: "#40916C" },
    { country: "Iran", value: 996.8, percentage: 45, color: "#52B788" },
    { country: "Canada", value: 747.7, percentage: 34, color: "#74C69D" },
    { country: "Germany", value: 681.8, percentage: 30, color: "#B7E4C7" }
  ];

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
                  backgroundColor: item.color, 
                  originX: 0
                }}
                variants={{
                  visible: { 
                    width: `${item.percentage}%`,
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
                style={{ left: `${item.percentage}%` }}
              >
                <span className="mr-2 font-bold text-xs md:text-base">{item.country}</span>
                <span className="text-xs md:text-base">{item.value}</span>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default EmissionsChart; 