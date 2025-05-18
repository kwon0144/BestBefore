import React, { useRef } from 'react';
import { motion } from "framer-motion";
import { fadeInUpVariant, fadeInVariant } from '../interfaces/AnimationVariants';

interface AustraliaWasteProps {
  setRef: (node: HTMLDivElement | null) => void;
}

const AustraliaWaste: React.FC<AustraliaWasteProps> = ({ setRef }) => {
  return (
    <motion.div 
      ref={setRef}
      id="australia-waste"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      variants={fadeInVariant}
      className="mt-12" 
      style={{ 
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/aus_food_waste.jpg)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        height: '400px',
        minHeight: '300px'
      }}
    >
      <div className="max-w-6xl mx-auto h-full flex flex-col justify-end pb-4 px-4 md:px-6">
        <motion.p 
          variants={fadeInUpVariant}
          className="text-darkgreen text-xl md:text-2xl font-bold"
        >
          Each year, Australians waste food across the supply chain in a total of
        </motion.p>
        <motion.h2 
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: { 
              opacity: 1, 
              scale: 1,
              transition: {
                duration: 0.8,
                delay: 0.2,
                ease: "easeOut"
              }
            }
          }}
          className="text-darkgreen text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-bold leading-tight"
        >
          7.6 million tonnes<sup className="text-lg md:text-2xl align-super ml-2 md:ml-4">1</sup>
        </motion.h2>
      </div>
    </motion.div>
  );
};

export default AustraliaWaste; 