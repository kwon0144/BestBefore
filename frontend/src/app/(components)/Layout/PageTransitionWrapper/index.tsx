'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PageTransitionWrapper({ children }: { children: React.ReactNode }) {

    const pathname = usePathname();
    const animate = (variants: any) => {
        return {
            initial: "initial",
            animate: "enter",
            exit: "exit",
            variants: variants
        }
    }

    const opacity = {
        initial: { opacity: 0 },
        enter: { opacity: 1, transition: { duration: 1.5, ease: [0.76, 0, 0.24, 1] } },
        exit: { opacity: 1 }
    };

    const slide = {
        initial: { y: "100vh" },
        enter: { y: "100vh" },
        exit: { y: "0vh", transition: { duration: 2, ease: [0.76, 0, 0.24, 1] } }
    }

    const perspective = {
        initial: { y:0, scale:1, opacity: 1},
        enter: { y:0, scale:1, opacity: 1 },
        exit: { y:-100, scale:0.9, opacity: 0, transition: { duration: 1.5, ease: [0.76, 0, 0.24, 1] } }
    }

    return (
        <div className="relative">
            <AnimatePresence initial={false}>
                <motion.div
                    key={pathname}
                    {...animate(slide)}
                    className="fixed inset-0 bg-background z-50 w-full h-full"
                />
            </AnimatePresence>
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    {...animate(perspective)}
                >
                <motion.div
                    key={pathname}
                    {...animate(opacity)}
                >
                    {children}
                </motion.div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}