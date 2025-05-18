/**
 * EconomicLoss Component
 * 
 * A visually striking headline component that displays "ECONOMIC LOSS" with 
 * animated decorative elements. Uses staggered animations to create an 
 * engaging reveal sequence with horizontal bars and fading text.
 * 
 * @component
 */
import React from 'react';
import { motion } from "framer-motion";

/**
 * Props for the EconomicLoss component
 * 
 * @interface EconomicLossProps
 * @property {function} setRef - Function to set the ref of this component for scrolling/visibility tracking
 */
interface EconomicLossProps {
  setRef: (node: HTMLDivElement | null) => void;
}

/**
 * EconomicLoss component displays a bold "ECONOMIC LOSS" heading with animated bars
 * that extend horizontally to frame the text. Uses Framer Motion for animations.
 * 
 * @param {EconomicLossProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const EconomicLoss: React.FC<EconomicLossProps> = ({ setRef }) => {
  return (
    <motion.div 
      ref={setRef}
      id="economic-loss"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.2 }
        }
      }}
      className="flex flex-col md:flex-row items-center px-0"
    >
      <div className="w-full space-y-2">
        {/* Top horizontal bar with expand animation */}
        <motion.div 
          className="w-3/5 h-12 md:h-24 bg-darkgreen overflow-hidden"
          variants={{
            hidden: { width: 0 },
            visible: { 
              width: "60%",
              transition: { duration: 0.8 }
            }
          }}
        ></motion.div>
        <div className="w-full flex flex-row items-center gap-4 md:gap-12">
          {/* Left horizontal bar with expand animation */}
          <motion.div 
            className="w-1/5 h-12 md:h-24 bg-darkgreen overflow-hidden"
            variants={{
              hidden: { width: 0 },
              visible: { 
                width: "20%",
                transition: { duration: 0.8, delay: 0.2 }
              }
            }}
          ></motion.div>
          {/* Main heading with slide and fade animation */}
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-darkgreen tracking-tight"
            variants={{
              hidden: { 
                opacity: 0,
                x: 50
              },
              visible: { 
                opacity: 1,
                x: 0,
                transition: {
                  duration: 0.8,
                  delay: 0.4
                }
              }
            }}
          >
            ECONOMIC LOSS
          </motion.h2> 
        </div>
        {/* Bottom horizontal bar with expand animation */}
        <motion.div 
          className="w-3/5 h-12 md:h-24 bg-darkgreen overflow-hidden"
          variants={{
            hidden: { width: 0 },
            visible: { 
              width: "60%",
              transition: { duration: 0.8, delay: 0.6 }
            }
          }}
        ></motion.div>  
      </div>
    </motion.div>
  );
};

export default EconomicLoss; 