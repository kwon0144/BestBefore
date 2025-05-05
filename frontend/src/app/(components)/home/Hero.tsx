/**
 * Hero Component
 * 
 * This component represents the main hero section of the homepage.
 * It features a full-screen background image with a gradient overlay,
 * animated text content, and a call-to-action button.
 * 
 * The component uses Framer Motion for smooth animations and transitions.
 */

"use client"

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import GradientText from "../Gradient Text";
import { motion } from 'framer-motion';

// Animation variants for the container
// Controls the fade-in effect of the entire hero section
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 1,
            ease: "easeInOut"
        }
    }
};

// Animation variants for the content
// Controls the slide-in effect of the text and button
const contentVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 1,
            delay: 1.2,
            ease: "easeOut"
        }
    }
};

export default function Hero() {
    const router = useRouter();

    return (
        // Main container with fade-in animation
        <motion.div 
            id="hero-section" 
            className="relative"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Gradient overlay that fades from left to right */}
            <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-[#F5F5F1]/90 to-[#F5F5F1]/10 z-10"
                variants={containerVariants}
            />
            {/* Full-screen background image */}
            <motion.div
                className="h-screen bg-cover bg-center"
                style={{
                backgroundImage: `url('https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/hero.jpg')`
                }}
                variants={containerVariants}
            >
            </motion.div>
            {/* Content container with slide-in animation */}
            <motion.div 
                className="max-w-6xl mx-auto absolute inset-0 flex flex-col justify-center items-start pl-5 z-20"
                variants={contentVariants}
            >
                <div className="max-w-3xl">
                    {/* Animated gradient text for the main heading */}
                    <GradientText
                        colors={["#2D5A4B", "#6FCF97",  "#2D5A4B", "#6FCF97", "#2D5A4B"]}
                        animationSpeed={15}
                        showBorder={false}
                        className="text-4xl md:text-5xl font-bold text-darkgreen mb-6"
                    >
                        Together for<br />
                        a zero-waste kitchen
                    </GradientText>
                    {/* Subheading text */}
                    <p className="text-xl md:text-2xl text-darkgreen mb-8 font-semibold">
                        Save food, money, and our planet with BestBefore
                    </p>
                    {/* Call-to-action button with gradient background */}
                    <Button 
                        className="bg-gradient-to-br from-[#2D5A4B] via-[#1B5E20] to-[#6FCF97] text-white px-8 py-7 rounded-lg text-lg font-medium hover:from-[#4CAF50] hover:via-[#2D5A4B] hover:to-[#1B5E20] transition-all duration-500"
                        onPress={() => {
                            router.push('/storage-assistant');
                        }}
                    >
                        Start Your Zero-Waste Journey
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    )
}

