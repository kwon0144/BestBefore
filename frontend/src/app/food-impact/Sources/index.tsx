/**
 * Sources Component
 * 
 * Displays a list of citation sources for the food waste impact data
 * presented throughout the application. Sources are displayed in a
 * numbered list with staggered animation effects.
 * 
 * @component
 */
import React from 'react';
import { motion } from 'framer-motion';

/**
 * Props for the Sources component
 * 
 * @interface SourcesProps
 * @property {function} setRef - Function to set the ref of this component for scrolling/visibility tracking
 */
interface SourcesProps {
  setRef: (node: HTMLDivElement | null) => void;
}

/**
 * Sources component displays citation information for data used in the application.
 * Features animated entries that appear sequentially as the user scrolls to this section.
 * 
 * @param {SourcesProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const Sources: React.FC<SourcesProps> = ({ setRef }) => {
  // Source data
  const sources = [
    "National Food Waste Strategy Feasibility Study (Source: Australian Government)",
    "Food waste costs Australian economy $36.6 billion annually (Source: Rabobank Food Waste Report 2023)",
    "Global greenhouse gas emissions from food systems (Source: UN FAO, Climate Watch)",
    "GHG emissions per kg of different food products (Source: Our World in Data based on Poore & Nemecek 2018)",
    "Company emissions: Scopes 1 & 2 - operational control, Scope 3 - category 11, upstream production only, 2021 (Source: company reporting)",
    "2023 Domestic GHG emissions only (Source: EDGAR Community GHG Database)",
    "Global food waste reduction initiatives and impact measurements (Source: UN Environment Programme)"
  ];

  return (
    <motion.div 
      ref={setRef}
      id="sources"
      className="bg-green-50 py-8 md:py-16"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ 
        opacity: 1,
        y: 0,
        transition: { duration: 0.8 }
      }}
      viewport={{ once: false, amount: 0.1 }}
    >
      {/* Section container with top border */}
      <div className="max-w-6xl mx-auto pt-4 border-t border-darkgreen px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-darkgreen mb-6 md:mb-8"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ 
            opacity: 1,
            x: 0,
            transition: { 
              duration: 0.5,
              delay: 0.2
            }
          }}
          viewport={{ once: false, amount: 0.5 }}
        >
          Sources
        </motion.h2>
        
        {/* Sources list with staggered animation */}
        <motion.div 
          className="space-y-3 md:space-y-4 text-gray-700"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            },
            hidden: {}
          }}
        >
          {/* Map through and render each source with animation */}
          {sources.map((source, index) => (
            <motion.div 
              key={index}
              className="flex items-start"
              variants={{
                visible: { 
                  opacity: 1, 
                  x: 0,
                  transition: { duration: 0.5 }
                },
                hidden: { 
                  opacity: 0, 
                  x: -20
                }
              }}
            >
              <span className="font-bold mr-2 md:mr-4 text-darkgreen">{index + 1}.</span>
              <p className="text-sm md:text-base">
                {source}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sources; 