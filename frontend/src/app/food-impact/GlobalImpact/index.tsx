import React from 'react';
import { motion } from "framer-motion";

interface GlobalImpactProps {
  setRef: (node: HTMLDivElement | null) => void;
}

const GlobalImpact: React.FC<GlobalImpactProps> = ({ setRef }) => {
  return (
    <>
      <motion.div 
        ref={setRef}
        id="around-world"
        className="flex flex-col md:flex-row items-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full space-y-2">
          <motion.div 
            className="w-3/5 h-12 md:h-24 bg-darkgreen overflow-hidden"
            initial={{ width: 0 }}
            whileInView={{ 
              width: "60%",
              transition: { duration: 0.8 }
            }}
            viewport={{ once: false, amount: 0.3 }}
          ></motion.div>
          <div className="w-full flex flex-row items-center gap-4 md:gap-12">
            <motion.div 
              className="w-1/5 h-12 md:h-24 bg-darkgreen overflow-hidden"
              initial={{ width: 0 }}
              whileInView={{ 
                width: "20%",
                transition: { duration: 0.8, delay: 0.2 }
              }}
              viewport={{ once: false, amount: 0.3 }}
            ></motion.div>
            <motion.h2 
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-darkgreen tracking-tight"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ 
                opacity: 1,
                x: 0,
                transition: {
                  duration: 0.8,
                  delay: 0.4
                }
              }}
              viewport={{ once: false, amount: 0.3 }}
            >
              Around the World
            </motion.h2> 
          </div>
          <motion.div 
            className="w-3/5 h-12 md:h-24 bg-darkgreen overflow-hidden"
            initial={{ width: 0 }}
            whileInView={{ 
              width: "60%",
              transition: { duration: 0.8, delay: 0.6 }
            }}
            viewport={{ once: false, amount: 0.3 }}
          ></motion.div>  
        </div>
      </motion.div>

      {/* Map Section */}
      <div className="py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-4xl font-bold text-darkgreen mb-4 md:mb-6">
            Global Food Waste Distribution
          </h2>
          <p className="text-gray-700 mb-6 md:mb-10">
            Food waste is a global issue with varying impacts across different regions.
          </p>
          {/* Map visualization to be added here */}
          <div className="h-[300px] md:h-[500px] w-full bg-gray-100 flex items-center justify-center border border-gray-200 rounded-lg">
            <p className="text-gray-500 text-base md:text-xl">Interactive map visualization will be added here</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalImpact; 