'use client';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
    const controls = useAnimation();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const sequence = async () => {
            // Slide up
            await controls.start({ y: 0 });
            // Hide the overlay
            setIsVisible(false);
        };
        sequence();
    }, [controls]);

    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            {isVisible && (
                <motion.div
                    initial={{ y: "100vh" }}
                    animate={controls}
                    transition={{
                        duration: 1,
                        ease: [0.22, 1, 0.36, 1]
                    }}
                    className="fixed inset-0 bg-background z-50"
                />
            )}
            <div>
                {children}
            </div>
        </div>
    );
}