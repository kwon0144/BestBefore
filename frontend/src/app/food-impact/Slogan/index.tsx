/**
 * Slogan Component
 * 
 * A visually striking slogan display that introduces the application's core message.
 * Features an animated gradient text alongside decorative horizontal bars that
 * animate in sequence to frame the slogan text.
 * 
 * @component
 */
import React from 'react';
import { motion } from "framer-motion";
import GradientText from "../../(components)/Gradient Text";
import { fadeInUpVariant } from '../interfaces/AnimationVariants';

/**
 * Props for the Slogan component
 * 
 * @interface SloganProps
 * @property {function} setSloganRef - Function to set the ref of this component for scrolling/visibility tracking
 */
interface SloganProps {
  setSloganRef: (node: HTMLDivElement | null) => void;
}

/**
 * Slogan component displays the app's main mission statement with animated elements.
 * Uses decorative horizontal bars and a gradient text effect to enhance visual appeal.
 * 
 * @param {SloganProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const Slogan: React.FC<SloganProps> = ({ setSloganRef }) => {
  return (
    <motion.div 
      ref={setSloganRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
          }
        }
      }}
      className="max-w-6xl mx-auto px-4 xl:px-0 flex flex-col md:flex-row items-center mb-8 md:mb-12 mt-12"
    >
      <div className="w-full flex flex-col md:flex-row items-center">
        {/* Decorative bars section - left side */}
        <div className="w-full md:w-1/3 mb-6 md:mb-0">
          {/* Top bar with grow animation */}
          <motion.div 
            className="w-3/5 h-8 md:h-16 bg-darkgreen overflow-hidden mb-4"
            variants={{
              hidden: { width: 0 },
              visible: { 
                width: "90%",
                transition: { duration: 0.6, delay: 0.1 }
              }
            }}
          ></motion.div>
          {/* Middle bar with grow animation */}
          <motion.div 
            className="w-2/5 h-8 md:h-16 bg-darkgreen overflow-hidden mb-4"
            variants={{
              hidden: { width: 0 },
              visible: { 
                width: "60%",
                transition: { duration: 0.6, delay: 0.3 }
              }
            }}
          ></motion.div>
          {/* Bottom bar with grow animation */}
          <motion.div 
            className="w-3/5 h-8 md:h-16 bg-darkgreen overflow-hidden mb-4"
            variants={{
              hidden: { width: 0 },
              visible: { 
                width: "90%",
                transition: { duration: 0.6, delay: 0.5 }
              }
            }}
          ></motion.div>
        </div>
        {/* Gradient text slogan - right side */}
        <motion.div 
          className="w-full md:w-2/3 flex flex-col gap-4 justify-center items-center"
          variants={fadeInUpVariant}
        >
          <GradientText
            colors={["#2D5A4B", "#6FCF97",  "#2D5A4B", "#6FCF97", "#2D5A4B"]}
            animationSpeed={15}
            showBorder={false}
            className="text-3xl sm:text-4xl md:text-5xl xl:text-7xl text-darkgreen mb-6"
            fontWeight="black"
            textAlign="center"
          >
            With BestBefore,<br />
            Make Melbourne More Sustainable.
          </GradientText>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Slogan; 