import { Variants } from "framer-motion";

/**
 * Animation variants for food waste visualization components
 * These predefined animation configurations can be reused across components
 * for consistent motion effects throughout the application.
 */

/**
 * Fade-in with upward movement animation
 * Used for elements that should appear by fading in while moving up
 * from their initial position
 */
export const fadeInUpVariant: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            duration: 0.8,
            bounce: 0.25
        }
    }
};

/**
 * Simple fade-in animation
 * Used for elements that should appear by fading in without any positional change
 */
export const fadeInVariant: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.6
        }
    }
};

/**
 * Container animation that staggers its children's animations
 * Use for parent elements whose children should animate sequentially
 * rather than all at once
 */
export const staggerContainerVariant: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

/**
 * Scale-in animation with fade effect
 * Used for elements that should appear by growing from a smaller size
 * while also fading in
 */
export const scaleInVariant: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.8
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            duration: 0.5
        }
    }
};

/**
 * Card animation with enter, center, and exit states
 * Used for card elements in carousels or sliders where cards
 * need to animate in, stay, and animate out
 */
export const cardVariants: Variants = {
    enter: {
        opacity: 0,
        y: 50,
    },
    center: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    },
    exit: {
        opacity: 0,
        y: -50,
        transition: {
            duration: 0.5,
            ease: "easeIn"
        }
    }
}; 