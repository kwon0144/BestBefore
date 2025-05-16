import React, { useRef, useEffect } from 'react';
import { motion } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSeedling, faShoppingCart, faTruck, faAppleAlt, faIndustry, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import * as echarts from "echarts";
import { fadeInUpVariant, fadeInVariant, staggerContainerVariant } from '../interfaces';

interface SupplyChainProps {
  setRef: (node: HTMLDivElement | null) => void;
}

const SupplyChain: React.FC<SupplyChainProps> = ({ setRef }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // ECharts setup for pie chart
  useEffect(() => {
    if (chartRef.current) {
      // Dispose any existing chart
      echarts.dispose(chartRef.current);
      
      // Create a new chart
      const chart = echarts.init(chartRef.current);
      
      // Simple configuration without animations
      const option = {
        animation: false,
        backgroundColor: 'transparent',
        tooltip: {
          trigger: "item",
          formatter: "{b}: {c} ({d}%)"
        },
        series: [
          {
            name: "Food Waste Stages",
            type: "pie",
            radius: "65%",
            center: ['50%', '50%'],
            data: [
              { value: 28, name: "Stage 1", itemStyle: { color: "#ff6b6b" } },
              { value: 22, name: "Stage 2", itemStyle: { color: "#ffd166" } },
              { value: 20, name: "Stage 3", itemStyle: { color: "#06d6a0" } },
              { value: 18, name: "Stage 4", itemStyle: { color: "#118ab2" } },
              { value: 12, name: "Stage 5", itemStyle: { color: "#073b4c" } },
            ],
            itemStyle: {
              borderRadius: 4,
              borderColor: '#fff',
              borderWidth: 1
            },
            label: {
              show: true,
              formatter: '{b}: {d}%',
              fontSize: 14
            }
          }
        ]
      };
      
      // Apply the configuration
      chart.setOption(option);
      
      // Handle window resize
      const handleResize = () => {
        chart.resize();
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        chart.dispose();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return (
    <motion.div 
      ref={setRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      variants={staggerContainerVariant}
      className="max-w-6xl mx-auto py-10 md:py-20 px-4 md:px-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Text Section */}
        <motion.div 
          variants={fadeInUpVariant}
          className="flex flex-col justify-center h-full"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-darkgreen mb-4 md:mb-6">
            What's in Our Food Waste?
          </h2>
          <p className="text-gray-700 mb-6 md:mb-8">
            Food waste varies significantly across different stages of the
            supply chain. Understanding its composition helps target reduction
            efforts more effectively.
          </p>
          <div className="space-y-3 md:space-y-4">
            <motion.div 
              variants={fadeInVariant}
              transition={{ delay: 0.1 }}
              className="flex items-center"
            >
              <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-400 mr-2 md:mr-3"></div>
              <span className="text-sm md:text-base text-gray-700">Stage 1</span>
            </motion.div>
            <motion.div 
              variants={fadeInVariant}
              transition={{ delay: 0.2 }}
              className="flex items-center"
            >
              <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-yellow-300 mr-2 md:mr-3"></div>
              <span className="text-sm md:text-base text-gray-700">Stage 2</span>
            </motion.div>
            <motion.div 
              variants={fadeInVariant}
              transition={{ delay: 0.3 }}
              className="flex items-center"
            >
              <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-400 mr-2 md:mr-3"></div>
              <span className="text-sm md:text-base text-gray-700">Stage 3</span>
            </motion.div>
            <motion.div 
              variants={fadeInVariant}
              transition={{ delay: 0.4 }}
              className="flex items-center"
            >
              <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-500 mr-2 md:mr-3"></div>
              <span className="text-sm md:text-base text-gray-700">Stage 4</span>
            </motion.div>
            <motion.div 
              variants={fadeInVariant}
              transition={{ delay: 0.5 }}
              className="flex items-center"
            >
              <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-900 mr-2 md:mr-3"></div>
              <span className="text-sm md:text-base text-gray-700">Stage 5</span>
            </motion.div>
          </div>
        </motion.div>
        {/* Supply Chain */}
        <motion.div variants={fadeInUpVariant}>
          {/* Supply chain icons - made responsive for small screens */}
          <div className="flex flex-wrap justify-center items-center mb-8 md:mb-12 overflow-x-auto">
            <div className="flex flex-col items-center mx-1 md:mx-2">
              <div className="bg-amber-300 rounded-full p-2 md:p-4 mb-2">
                <FontAwesomeIcon icon={faSeedling} className="text-lg md:text-2xl text-gray-800" />
              </div>
              <span className="text-[10px] md:text-xs text-gray-600 text-center">PRODUCTION</span>
            </div>
            <div className="mx-1">
              <FontAwesomeIcon icon={faArrowRight} className="text-amber-400 text-sm md:text-base" />
            </div>
            <div className="flex flex-col items-center mx-1 md:mx-2">
              <div className="bg-amber-300 rounded-full p-2 md:p-4 mb-2">
                <FontAwesomeIcon icon={faIndustry} className="text-lg md:text-2xl text-gray-800" />
              </div>
              <span className="text-[10px] md:text-xs text-gray-600 text-center max-w-[60px] md:max-w-none">
                PROCESSING
              </span>
            </div>
            <div className="mx-1">
              <FontAwesomeIcon icon={faArrowRight} className="text-amber-400 text-sm md:text-base" />
            </div>
            <div className="flex flex-col items-center mx-1 md:mx-2">
              <div className="bg-amber-300 rounded-full p-2 md:p-4 mb-2">
                <FontAwesomeIcon icon={faTruck} className="text-lg md:text-2xl text-gray-800" />
              </div>
              <span className="text-[10px] md:text-xs text-gray-600 text-center max-w-[60px] md:max-w-none">
                DISTRIBUTION
              </span>
            </div>
            <div className="mx-1">
              <FontAwesomeIcon icon={faArrowRight} className="text-amber-400 text-sm md:text-base" />
            </div>
            <div className="flex flex-col items-center mx-1 md:mx-2">
              <div className="bg-amber-300 rounded-full p-2 md:p-4 mb-2">
                <FontAwesomeIcon icon={faShoppingCart} className="text-lg md:text-2xl text-gray-800" />
              </div>
              <span className="text-[10px] md:text-xs text-gray-600 text-center">RETAIL</span>
            </div>
            <div className="mx-1">
              <FontAwesomeIcon icon={faArrowRight} className="text-amber-400 text-sm md:text-base" />
            </div>
            <div className="flex flex-col items-center mx-1 md:mx-2">
              <div className="bg-amber-300 rounded-full p-2 md:p-4 mb-2">
                <FontAwesomeIcon icon={faAppleAlt} className="text-lg md:text-2xl text-gray-800" />
              </div>
              <span className="text-[10px] md:text-xs text-gray-600 text-center">CONSUMPTION</span>
            </div>
          </div>
          {/* Separate the chart from motion animations */}
          <div ref={chartRef} className="w-full h-60 md:h-80"></div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SupplyChain; 