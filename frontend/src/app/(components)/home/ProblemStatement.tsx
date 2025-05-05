/**
 * ProblemStatement Component
 * 
 * This component displays key statistics and information about the food waste crisis
 * using animated cards with icons. It uses Framer Motion for animations and FontAwesome
 * for icons.
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faWeight, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

export default function ProblemStatement() {
    // Array of card data containing icon, title, and description for each statistic
    const cards = [
        {
            icon: faDollarSign,
            title: "$2,000+",
            description: "Wasted per household annually on discarded food"
        },
        {
            icon: faWeight,
            title: "200,000+ tonnes",
            description: "Of food wasted in Victoria alone each year"
        },
        {
            icon: faGlobe,
            title: "Environmental Impact",
            description: "Food waste is a major contributor to greenhouse gas emissions"
        }
    ];

    return (
        // Main container with background and padding
        <div id="problem-statement" className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-6">
                {/* Animated heading with fade-in and slide-up effect */}
                <motion.h2 
                    className="text-3xl md:text-4xl font-bold text-darkgreen text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    The Food Waste Crisis
                </motion.h2>
                
                {/* Grid container for the three statistic cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {cards.map((card, index) => (
                        // Animated card with staggered animation delay based on index
                        <motion.div 
                            key={index} 
                            className="bg-white p-8 rounded-lg shadow-md text-center"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ 
                                duration: 1,
                                ease: "easeOut",
                                delay: 0.5 + (index * 0.2)
                            }}
                        >
                            {/* Icon container with orange color */}
                            <div className="text-[#FF8C42] mb-4">
                                <FontAwesomeIcon icon={card.icon} className="text-5xl" />
                            </div>
                            {/* Card title */}
                            <h3 className="text-2xl font-semibold text-darkgreen mb-3">{card.title}</h3>
                            {/* Card description */}
                            <p className="text-gray-700">
                                {card.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}