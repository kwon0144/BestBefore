import React from 'react';
import { motion } from 'framer-motion';

interface CostOfFoodWasteProps {
  setRef?: (node: HTMLDivElement | null) => void;
}

const CostOfFoodWaste: React.FC<CostOfFoodWasteProps> = ({ setRef }) => {
  return (
    <div className="py-20" ref={setRef}>
      <motion.div 
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ 
            opacity: 1,
            transition: { duration: 0.6 }
        }}
        viewport={{ once: false, amount: 0.2 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            <div className="px-4">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ 
                        opacity: 1,
                        x: 0,
                        transition: {
                            type: "spring",
                            duration: 0.8,
                            bounce: 0.25
                        }
                    }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="mb-6 text-3xl font-bold leading-tight"
                >
                    <p>
                        <span className="bg-green text-white px-4 py-2 inline-block mr-1">Household food waste</span> 
                        amounts to <span className="bg-green text-white px-4 py-2 inline-block mr-1">$19.3 billion (52.7%)</span> annually, and costs up to <span className="bg-green text-white px-4 py-2 inline-block mr-1">$2,500 per household</span>.
                    </p>
                </motion.div>

                <motion.p 
                    className="text-lg font-bold leading-snug mt-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ 
                        opacity: 1,
                        transition: {
                        delay: 0.8,
                        duration: 0.8
                        }
                    }}
                    viewport={{ once: false, amount: 0.3 }}
                >
                If we reduced this waste, families could redirect that money toward essentials like groceries, bills, education, or savings, making a meaningful difference in everyday life.
                </motion.p>
            </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ 
                opacity: 1,
                scale: 1,
                transition: {
                    type: "spring",
                    duration: 0.8,
                    bounce: 0.25,
                    delay: 0.4
                }
            }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <div className="relative h-64">
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                        className="w-64 h-64 rounded-full bg-lightgreen relative"
                        animate={{ 
                            rotate: [0, 5, 0, -5, 0],
                        }}
                        transition={{
                            duration: 10,
                            ease: "easeInOut",
                            repeat: Infinity,
                        }}
                    >
                        <motion.div 
                            className="absolute bottom-0 right-0 w-12 h-12 rounded-full bg-darkgreen flex items-center justify-center text-xs text-white font-bold"
                            whileHover={{ scale: 1.2 }}
                        >
                            $40b
                        </motion.div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
                            <motion.div 
                                className="text-lg font-bold"
                                initial={{ opacity: 0 }}
                                whileInView={{ 
                                    opacity: 1,
                                    transition: {
                                        delay: 0.6,
                                        duration: 0.4
                                    }
                                }}
                                viewport={{ once: false, amount: 0.3 }}
                            >
                                $2.7 trillion
                            </motion.div>
                            <motion.div 
                                className="text-xs"
                                initial={{ opacity: 0 }}
                                whileInView={{ 
                                    opacity: 1,
                                    transition: {
                                        delay: 0.8,
                                        duration: 0.4
                                    }
                                }}
                                viewport={{ once: false, amount: 0.3 }}
                            >
                                Global waste management industry income in 2023
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CostOfFoodWaste;