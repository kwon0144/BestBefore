/**
 * EconomicWasteViz Component
 * 
 * An interactive visualization demonstrating the economic impact of food waste.
 * Features a slider that allows users to see how changes in food waste levels
 * affect economic metrics, with a dynamic background that visualizes the
 * transition between economic prosperity and waste.
 * 
 * @component
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MetricCardProps } from '../interfaces/Components';
import { scaleInVariant, staggerContainerVariant } from '../interfaces/AnimationVariants';
import { 
  faArrowDown, 
  faArrowUp, 
  faDollarSign, 
  faWeightHanging, 
  faHome,
  faRecycle,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { Slider } from "@heroui/react";

/**
 * Linear Regression Model Constants
 * Based on analysis of historical data showing the relationship
 * between food waste tonnage and economic loss
 */
const MODEL_SLOPE = 1.0002;
const MODEL_INTERCEPT = -26.6881;

/**
 * Calculate economic loss based on total waste using a linear regression model
 * 
 * @param {number} totalWaste - Total waste amount in million tonnes
 * @returns {number} Calculated economic loss
 */
const calculateEconomicLoss = (totalWaste: number): number => {
  return MODEL_INTERCEPT + (MODEL_SLOPE * totalWaste * 1000);
};

/**
 * Props for the EconomicWasteViz component
 * 
 * @interface EconomicWasteVizProps
 * @property {function} setMetricCardsRef - Function to set the ref of the metric cards container
 */
interface EconomicWasteVizProps {
  setMetricCardsRef: (node: HTMLDivElement | null) => void;
}

/**
 * Helper function to get the correct Tailwind color class
 * Maps color names and types to appropriate Tailwind class names
 * 
 * @param {string} type - Type of style (text, bg, etc.)
 * @param {string} color - Color name (teal, blue, etc.)
 * @param {string} [suffix='500'] - Color intensity suffix
 * @returns {string} The corresponding Tailwind class
 */
const getColorClass = (type: string, color: string, suffix: string = '500'): string => {
  // Direct mapping of all possible combinations
  if (type === 'text' && color === 'teal' && suffix === '500') return 'text-teal-500';
  if (type === 'text' && color === 'teal' && suffix === '600') return 'text-teal-600';
  if (type === 'text' && color === 'blue' && suffix === '500') return 'text-blue-500';
  if (type === 'text' && color === 'blue' && suffix === '600') return 'text-blue-600';
  if (type === 'text' && color === 'amber' && suffix === '500') return 'text-amber-500';
  if (type === 'text' && color === 'amber' && suffix === '600') return 'text-amber-600';
  if (type === 'text' && color === 'green' && suffix === '500') return 'text-green-500';
  if (type === 'text' && color === 'green' && suffix === '600') return 'text-green-600';
  if (type === 'text' && color === 'red' && suffix === '600') return 'text-red-600';

  if (type === 'bg' && color === 'teal') return 'bg-teal-500';
  if (type === 'bg' && color === 'blue') return 'bg-blue-500';
  if (type === 'bg' && color === 'amber') return 'bg-amber-500';
  
  return ''; // Default fallback
};

/**
 * MetricCard Component
 * 
 * Displays a single metric related to food waste with animated visual elements
 * and interactive hover effects.
 * 
 * @param {MetricCardProps} props - Component props from the Components interface
 * @returns {JSX.Element} Rendered component
 */
const MetricCard: React.FC<MetricCardProps> = ({ 
  icon, 
  title, 
  value, 
  unit, 
  changePercent, 
  isIncrease, 
  fillPercent, 
  color 
}) => {
  return (
    <motion.div
      className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 shadow-md border border-gray-100"
      variants={scaleInVariant}
      whileHover={{ 
        scale: 1.03,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { 
          duration: 0.2 
        }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Card header with icon and title */}
      <div className="flex items-center justify-start mb-2 md:mb-4">
        <FontAwesomeIcon icon={icon} className={`mr-1 ${getColorClass('text', color)} text-base md:text-xl`} />
        <h3 className="text-gray-500 text-sm md:text-base font-medium">{title}</h3>
      </div>
      
      {/* Metric value with animation */}
      <div className="flex items-end justify-start">
        {unit === '$' && <span className="text-xl md:text-3xl font-bold text-teal-600">$</span>}
        <motion.span
          className={`text-2xl md:text-4xl font-bold ${getColorClass('text', color, '600')}`}
          initial={{ opacity: 0 }}
          whileInView={{
            opacity: 1,
            transition: {
              delay: 0.3,
              duration: 0.5
            }
          }}
          viewport={{ once: false, amount: 0.8 }}
        >
          {value}
        </motion.span>
        <span className={`text-xl md:text-3xl font-bold ${getColorClass('text', color, '600')}`}>{unit !== '$' ? unit : ''}</span>
      </div>
      
      {/* Change indicator */}
      <div className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 text-left">
        <span className={`inline-flex items-center ${isIncrease ? 'text-red-600' : 'text-green'}`}>
          <FontAwesomeIcon icon={isIncrease ? faArrowUp : faArrowDown} className="mr-1" /> {changePercent}% from last year
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-100 mt-2 md:mt-4 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColorClass('bg', color)} rounded-full metric-progress-bar`}
          style={{ width: `${fillPercent}%` }}
        ></div>
      </div>
    </motion.div>
  );
};

/**
 * EconomicWasteViz main component
 * 
 * An interactive visualization showing how changes in food waste levels
 * affect economic metrics like cost, waste tonnage, and household percentage.
 * 
 * @param {EconomicWasteVizProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const EconomicWasteViz: React.FC<EconomicWasteVizProps> = ({ setMetricCardsRef }) => {
  // Base values at 50% slider position
  const baseWasteAmount = 7.6; // M tonnes
  const [wasteAmount, setWasteAmount] = useState(baseWasteAmount);
  const [economicLoss, setEconomicLoss] = useState(36.6); // B dollars
  const [householdWaste, setHouseholdWaste] = useState(52.7); // %
  
  // Percentage changes - will be dynamically updated
  const [costPercentChange, setCostPercentChange] = useState(2.3);
  const [wastePercentChange, setWastePercentChange] = useState(1.8);
  const [householdPercentChange, setHouseholdPercentChange] = useState(0.5);
  
  // Track if values are increasing or decreasing
  const [isCostIncreasing, setIsCostIncreasing] = useState(false);
  const [isWasteIncreasing, setIsWasteIncreasing] = useState(false);
  const [isHouseholdIncreasing, setIsHouseholdIncreasing] = useState(true);
  
  /**
   * Add CSS for smooth progress bar transitions
   */
  React.useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    style.innerHTML = `
      .metric-progress-bar {
        transition: width 0.3s ease-in-out;
      }
    `;
    document.head.appendChild(style);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  /**
   * Initialize progress bars on component mount
   */
  React.useEffect(() => {
    // Give the DOM time to render
    setTimeout(() => {
      const progressBars = document.querySelectorAll('.metric-progress-bar');
      progressBars.forEach(bar => {
        // Initialize to match the default slider value (50)
        (bar as HTMLElement).style.width = '50%';
      });
    }, 100);
  }, []);
  
  return (
    <div 
      className="py-12 md:py-20 mb-12 md:mb-20 px-4 relative"
      style={{
        backgroundImage: `url('https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/low_cost.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        zIndex: 1
      }}
      id="impactSection"
    >
      {/* Overlay for the second image with dynamic opacity */}
      <div 
        id="overlayImage"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url('https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/high_cost.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.5,
          transition: 'opacity 500ms ease',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />

      {/* Dark overlay to control base image visibility */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          zIndex: 3,
          pointerEvents: 'none'
        }}
      />
      
      {/* Interactive Section - Card with content */}
      <div 
        className="max-w-4xl mx-auto text-center bg-white bg-opacity-80 p-4 sm:p-6 md:p-10 rounded-xl md:rounded-2xl backdrop-blur-md m-4 md:m-auto relative shadow-xl"
        style={{ zIndex: 10, position: 'relative' }}
      >
        <h2 className="bg-green text-white text-xl sm:text-2xl md:text-3xl font-bold px-3 py-1 sm:px-4 sm:py-2 inline-block mb-3 md:mb-4">
          Your actions today can create a better tomorrow.
        </h2>
        <p className="text-darkgreen font-bold text-base md:text-lg mb-6 md:mb-12 leading-relaxed max-w-3xl mx-auto px-2">
          By reducing food waste, you're not just saving money - you're contributing to a
          more sustainable future. Slide to see how your choices can make a
          difference.
        </p>
        
        {/* Slider control section */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-2xl mb-6 md:mb-10 px-4">
            <div className="flex items-center justify-between gap-2 md:gap-4">
              {/* "Less Waste" icon and label */}
              <div className="text-center">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-teal-500 flex items-center justify-center mx-auto mb-1 md:mb-2 shadow-md">
                  <FontAwesomeIcon icon={faRecycle} className="text-white text-sm md:text-xl" />
                </div>
                <p className="font-medium text-xs md:text-sm text-teal-700">Less Waste</p>
              </div>
              
              {/* Interactive slider that updates visualizations */}
              <div className="flex-1 mx-2 md:mx-4">
                <Slider
                  className="w-full cursor-pointer"
                  color="primary"
                  defaultValue={50}
                  minValue={0}
                  maxValue={100}
                  step={1}
                  onChange={(value: number | number[]) => {
                    // Ensure we're dealing with a single number
                    const numericValue = Array.isArray(value) ? value[0] : value;
                    const opacity = numericValue / 100;
                    const overlayElement = document.getElementById("overlayImage");
                    if (overlayElement) {
                      overlayElement.style.opacity = opacity.toString();
                    }
                    
                    // Calculate new waste amount based on slider position
                    // 0% = 50% of base waste, 100% = 150% of base waste
                    const scaleFactor = 0.5 + (numericValue / 100);
                    const newWasteAmount = parseFloat((baseWasteAmount * scaleFactor).toFixed(1));
                    setWasteAmount(newWasteAmount);
                    
                    // Calculate economic loss using linear regression model
                    // Convert to billions by dividing by 1000
                    const newEconomicLoss = parseFloat((calculateEconomicLoss(newWasteAmount) / 1000).toFixed(1));
                    setEconomicLoss(newEconomicLoss);
                    
                    // Update household waste (scaled slightly differently)
                    const newHouseholdWaste = parseFloat((52.7 * (0.8 + (numericValue / 250))).toFixed(1));
                    setHouseholdWaste(newHouseholdWaste);
                    
                    // Update percentage changes based on slider position
                    // For cost: ranges from -5% to +8% (low waste = decrease, high waste = increase)
                    const newCostPercentChange = parseFloat((numericValue / 20 - 2.5).toFixed(1));
                    setCostPercentChange(Math.abs(newCostPercentChange));
                    setIsCostIncreasing(newCostPercentChange > 0);
                    
                    // For waste amount: ranges from -4% to +6%
                    const newWastePercentChange = parseFloat((numericValue / 25 - 2).toFixed(1));
                    setWastePercentChange(Math.abs(newWastePercentChange));
                    setIsWasteIncreasing(newWastePercentChange > 0);
                    
                    // For household percentage: ranges from -1% to +3%
                    const newHouseholdPercentChange = parseFloat((numericValue / 50 - 1).toFixed(1));
                    setHouseholdPercentChange(Math.abs(newHouseholdPercentChange));
                    setIsHouseholdIncreasing(newHouseholdPercentChange > 0);
                    
                    // Update impact text based on slider value
                    const impactText = document.getElementById("impactText");
                    const modelText = document.getElementById("modelText");
                    
                    if (impactText) {
                      if (numericValue < 25) {
                        impactText.textContent = "Minimal food waste leads to significant economic and environmental benefits";
                      } else if (numericValue < 50) {
                        impactText.textContent = "Moderate food waste reduction still provides substantial benefits";
                      } else if (numericValue < 75) {
                        impactText.textContent = "Increasing food waste creates economic and environmental costs";
                      } else {
                        impactText.textContent = "Heavy food waste creates severe financial and environmental impact";
                      }
                    }
                    
                    if (modelText) {
                      modelText.textContent = `Economic Loss (Billion $) = ${(MODEL_INTERCEPT/1000).toFixed(4)} + ${(MODEL_SLOPE/1000).toFixed(6)} × Total Waste (Tons)`;
                    }
                    
                    // Directly update the progress bars
                    const progressBars = document.querySelectorAll('.metric-progress-bar');
                    // Use requestAnimationFrame for smoother animation
                    requestAnimationFrame(() => {
                      progressBars.forEach(bar => {
                        (bar as HTMLElement).style.width = `${numericValue}%`;
                      });
                    });
                  }}
                />
              </div>
              
              {/* "More Waste" icon and label */}
              <div className="text-center">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-1 md:mb-2 shadow-md">
                  <FontAwesomeIcon icon={faTrash} className="text-white text-sm md:text-xl" />
                </div>
                <p className="font-medium text-xs md:text-sm text-red-700">More Waste</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Cards Section */}
        <motion.div 
          ref={setMetricCardsRef}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={staggerContainerVariant}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6"
        >
          {/* Annual Cost Card */}
          <MetricCard 
            icon={faDollarSign}
            title="Annual Cost"
            value={economicLoss}
            unit="B"
            changePercent={costPercentChange}
            isIncrease={isCostIncreasing}
            fillPercent={50} // Default to match slider initial value
            color="teal"
          />

          {/* Tonnes Wasted Card */}
          <MetricCard 
            icon={faWeightHanging}
            title="Tonnes Wasted"
            value={wasteAmount}
            unit="M"
            changePercent={wastePercentChange}
            isIncrease={isWasteIncreasing}
            fillPercent={50} // Default to match slider initial value
            color="blue"
          />

          {/* Household Waste Card */}
          <MetricCard 
            icon={faHome}
            title="Household Waste"
            value={householdWaste}
            unit="%"
            changePercent={householdPercentChange}
            isIncrease={isHouseholdIncreasing}
            fillPercent={50} // Default to match slider initial value
            color="amber"
          />
        </motion.div>
        
        {/* Impact description text that updates based on slider position */}
        <div id="impactText" className="text-sm md:text-base text-darkgreen font-semibold mt-2 min-h-[24px]">
          Moderate food waste reduction still provides substantial benefits
        </div>
        
        {/* Model equation display */}
        <div id="modelText" className="text-xs text-gray-600 italic mt-2 min-h-[24px]">
          Economic Loss (Billion $) = -0.0267 + 0.000001 × Total Waste (Tons)
        </div>
      </div>
    </div>
  );
};

export default EconomicWasteViz; 