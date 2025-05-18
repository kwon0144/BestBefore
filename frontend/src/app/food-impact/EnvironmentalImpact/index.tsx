/**
 * EnvironmentalImpact Component
 * 
 * Visualizes the environmental impact of food waste with a dynamic scroll-driven
 * animation featuring an Earth image and rotating information cards. The component
 * shows different statistics about CO2 emissions, temperature impacts, and global
 * greenhouse gas emissions from food waste.
 * 
 * @component
 */
import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIndustry, faArrowUp, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { cardVariants } from '../interfaces/AnimationVariants';
import { EnvironmentalCardProps } from '../interfaces/Components';

/**
 * Props for the EnvironmentalImpact component
 * 
 * @interface EnvironmentalImpactProps
 * @property {function} setRef - Function to set the ref of this component for scrolling/visibility tracking
 */
interface EnvironmentalImpactProps {
  setRef: (node: HTMLDivElement | null) => void;
}

/**
 * A reusable card component for displaying environmental impact information
 * 
 * @component
 * @param {EnvironmentalCardProps} props - Props for the card including icon, styling, and content
 * @returns {JSX.Element} Rendered component
 */
const EnvironmentalCard: React.FC<EnvironmentalCardProps> = ({ 
  icon, 
  backgroundColor, 
  borderColor, 
  children 
}) => {
  return (
    <div className={`bg-white p-4 md:p-8 rounded-xl shadow-lg border-l-4 border-${borderColor} hover:shadow-xl`}>
      <div className="flex flex-col items-start">
        <div className={`p-3 md:p-4 bg-${backgroundColor} rounded-full mb-4`}>
          <FontAwesomeIcon icon={icon} className={`text-${borderColor} text-xl md:text-2xl`} />
        </div>
        <div className="text-start">
          <div className="text-base md:text-2xl font-semibold leading-tight mb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * EnvironmentalImpact main component displaying a scroll-activated sequence of impact cards
 * alongside an Earth image. On desktop, cards change as the user scrolls, while on mobile
 * they appear stacked for easier viewing.
 * 
 * @param {EnvironmentalImpactProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const EnvironmentalImpact: React.FC<EnvironmentalImpactProps> = ({ setRef }) => {
  // Refs for scroll tracking
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const earthSectionRef = useRef<HTMLDivElement>(null);
  // State to track which impact card is currently active
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  
  /**
   * Track scroll progress within the environmental section
   * Used to determine which card to display on desktop
   */
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end start"]
  });
  
  /**
   * Maps scroll progress to card indices
   * Transforms continuous scroll values to discrete card indices
   */
  const currentCardIndex = useTransform(
    scrollYProgress,
    [0, 0.2, 0.2, 0.4, 0.4, 0.6], // Adjusted thresholds for smoother transitions
    [0, 0, 1, 1, 2, 2]
  );
  
  /**
   * Updates the active card index when scroll position changes
   */
  useEffect(() => {
    const unsubscribe = currentCardIndex.onChange((latest) => {
      setActiveCardIndex(Math.round(latest));
    });
    return unsubscribe;
  }, [currentCardIndex]);

  return (
    <>
      {/* Title section with animated bars */}
      <motion.div 
        ref={setRef}
        id="environmental-impact"
        className="py-4 md:py-8 px-0"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full space-y-2">
          {/* Top horizontal bar */}
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
            {/* Left horizontal bar */}
            <motion.div 
              className="w-1/5 h-12 md:h-24 bg-darkgreen overflow-hidden"
              initial={{ width: 0 }}
              whileInView={{ 
                width: "10%",
                transition: { duration: 0.8, delay: 0.2 }
              }}
              viewport={{ once: false, amount: 0.3 }}
            ></motion.div>
            {/* Main title with slide-in animation */}
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
              Environmental Impact
            </motion.h2> 
          </div>
          {/* Bottom horizontal bar */}
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
    
      {/* Scrollable content container */}
      <div className="h-auto lg:h-[250vh]" ref={scrollContainerRef}>
        <div className="w-full lg:sticky lg:top-0 lg:left-0 lg:h-screen flex flex-col">
          <div className="flex-grow flex items-center justify-center py-4">
            <div className="container mx-auto px-4 md:px-8 max-w-6xl">
              <div className="flex flex-col lg:flex-row gap-6 md:gap-10 h-full">
                {/* Earth Image Section */}
                <div className="w-full lg:w-1/2 flex items-center justify-center" ref={earthSectionRef}>
                  <img
                    src="https://readdy.ai/api/search-image?query=Planet%20Earth%20from%20space%20showing%20atmospheric%20effects%20and%20climate%20change%20with%20dramatic%20cloud%20formations%20and%20visible%20pollution%20effects%20professional%20space%20photography%20with%20high%20detail%20and%20environmental%20storytelling&width=600&height=600&seq=11&orientation=squarish"
                    alt="Earth climate impact"
                    className="w-full h-[300px] md:h-[400px] object-cover rounded-xl shadow-xl"
                  />
                </div>

                {/* Impact Cards Container */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center pt-4 lg:pt-0">
                  {/* For mobile/tablet: show all cards stacked */}
                  <div className="lg:hidden space-y-6">
                    {/* Card 1 - CO2 Generation */}
                    <motion.div 
                      className="bg-white p-4 md:p-8 rounded-xl shadow-lg border-l-4 border-red-500 hover:shadow-xl"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ 
                        opacity: 1, 
                        y: 0,
                        transition: {
                          duration: 0.5
                        }
                      }}
                      viewport={{ once: false, amount: 0.3 }}
                    >
                      <div className="flex flex-col items-start">
                        <div className="p-3 md:p-4 bg-red-100 rounded-full mb-4">
                          <FontAwesomeIcon icon={faIndustry} className="text-red-500 text-xl md:text-2xl" />
                        </div>
                        <div className="text-start">
                          <div className="text-base md:text-2xl font-semibold leading-tight mb-4">
                            <p><span className="bg-red-500 text-white text-lg md:text-2xl font-bold px-2 py-1 md:px-4 md:py-2 inline-block">17.5 million tonnes</span> of CO2 generated from the production and disposal
                            of food that is wasted in Australia (excluding exports).<sup className="text-xs align-super ml-1">1</sup></p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Card 2 - Temperature Impact */}
                    <motion.div 
                      className="bg-white p-4 md:p-8 rounded-xl shadow-lg border-l-4 border-amber-500 hover:shadow-xl"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ 
                        opacity: 1, 
                        y: 0,
                        transition: {
                          duration: 0.5,
                          delay: 0.2
                        }
                      }}
                      viewport={{ once: false, amount: 0.3 }}
                    >
                      <div className="flex flex-col items-start">
                        <div className="p-3 md:p-4 bg-amber-100 rounded-full mb-4">
                          <FontAwesomeIcon icon={faArrowUp} className="text-amber-500 text-xl md:text-2xl" />
                        </div>
                        <div className="text-start">
                          <div className="text-base md:text-2xl font-semibold leading-tight mb-4">
                            <p>Emissions from food waste alone would push global temperatures beyond <span className="bg-amber-500 text-white text-lg md:text-2xl font-bold px-2 py-1 md:px-4 md:py-2 inline-block">1.5°C or 2°C</span> this century if left unchecked.<sup className="text-xs align-super ml-1">3</sup></p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Card 3 - Global Impact */}
                    <motion.div 
                      className="bg-white p-4 md:p-8 rounded-xl shadow-lg border-l-4 border-green hover:shadow-xl"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ 
                        opacity: 1, 
                        y: 0,
                        transition: {
                          duration: 0.5,
                          delay: 0.4
                        }
                      }}
                      viewport={{ once: false, amount: 0.3 }}
                    >
                      <div className="flex flex-col items-start">
                        <div className="p-3 md:p-4 bg-green bg-opacity-20 rounded-full mb-4">
                          <FontAwesomeIcon icon={faGlobe} className="text-green text-xl md:text-2xl" />
                        </div>
                        <div className="text-start">
                          <div className="text-base md:text-2xl font-semibold leading-tight mb-4">
                            <p>Around <span className="bg-green text-lg md:text-2xl text-white font-bold px-2 py-1 md:px-4 md:py-2 inline-block">25-30%</span> 
                              of global greenhouse gas emissions come from food systems, <span className="bg-green text-lg md:text-2xl text-white font-bold px-2 py-1 md:px-4 md:py-2 inline-block">increasing to one-third</span> when including all agricultural products.<sup className="text-xs align-super ml-1">3</sup></p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* For desktop: show animated cards based on scroll */}
                  <div className="hidden lg:block">
                    <AnimatePresence mode="wait">
                      {/* Card 1 - CO2 Generation */}
                      {activeCardIndex === 0 && (
                        <motion.div 
                          key="card1"
                          className="bg-white p-4 md:p-8 rounded-xl shadow-lg border-l-4 border-red-500 hover:shadow-xl"
                          initial="enter"
                          animate="center"
                          exit="exit"
                          variants={cardVariants}
                        >
                          <div className="flex flex-col items-start">
                            <div className="p-3 md:p-4 bg-red-100 rounded-full mb-4">
                              <FontAwesomeIcon icon={faIndustry} className="text-red-500 text-xl md:text-2xl" />
                            </div>
                            <div className="text-start">
                              <div className="text-base md:text-2xl font-semibold leading-tight mb-4">
                                <p><span className="bg-red-500 text-white text-lg md:text-2xl font-bold px-2 py-1 md:px-4 md:py-2 inline-block">17.5 million tonnes</span> of CO2 generated from the production and disposal
                                of food that is wasted in Australia (excluding exports).<sup className="text-xs align-super ml-1">1</sup></p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Card 2 - Temperature Impact */}
                      {activeCardIndex === 1 && (
                        <motion.div 
                          key="card2"
                          className="bg-white p-4 md:p-8 rounded-xl shadow-lg border-l-4 border-amber-500 hover:shadow-xl"
                          initial="enter"
                          animate="center"
                          exit="exit"
                          variants={cardVariants}
                        >
                          <div className="flex flex-col items-start">
                            <div className="p-3 md:p-4 bg-amber-100 rounded-full mb-4">
                              <FontAwesomeIcon icon={faArrowUp} className="text-amber-500 text-xl md:text-2xl" />
                            </div>
                            <div className="text-start">
                              <div className="text-base md:text-2xl font-semibold leading-tight mb-4">
                                <p>Emissions from food waste alone would push global temperatures beyond <span className="bg-amber-500 text-white text-lg md:text-2xl font-bold px-2 py-1 md:px-4 md:py-2 inline-block">1.5°C or 2°C</span> this century if left unchecked.<sup className="text-xs align-super ml-1">3</sup></p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Card 3 - Global Impact */}
                      {activeCardIndex === 2 && (
                        <motion.div 
                          key="card3"
                          className="bg-white p-4 md:p-8 rounded-xl shadow-lg border-l-4 border-green hover:shadow-xl"
                          initial="enter"
                          animate="center"
                          exit="exit"
                          variants={cardVariants}
                        >
                          <div className="flex flex-col items-start">
                            <div className="p-3 md:p-4 bg-green bg-opacity-20 rounded-full mb-4">
                              <FontAwesomeIcon icon={faGlobe} className="text-green text-xl md:text-2xl" />
                            </div>
                            <div className="text-start">
                              <div className="text-base md:text-2xl font-semibold leading-tight mb-4">
                                <p>Around <span className="bg-green text-lg md:text-2xl text-white font-bold px-2 py-1 md:px-4 md:py-2 inline-block">25-30%</span> 
                                  of global greenhouse gas emissions come from food systems, <span className="bg-green text-lg md:text-2xl text-white font-bold px-2 py-1 md:px-4 md:py-2 inline-block">increasing to one-third</span> when including all agricultural products.<sup className="text-xs align-super ml-1">3</sup></p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnvironmentalImpact; 