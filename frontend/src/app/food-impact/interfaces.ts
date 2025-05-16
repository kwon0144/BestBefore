// Animation Variants
import { Variants } from "framer-motion";

export interface CardInfo {
    country: string;
    value: number;
    percentage: number;
    color: string;
}

export interface SupplyChainStage {
    icon: any;
    name: string;
}

export interface MetricCardProps {
    icon: any;
    title: string;
    value: number;
    unit: string;
    changePercent: number;
    isIncrease: boolean;
    fillPercent: number;
    color: string;
}

export interface ProgressNavItemProps {
    icon: any;
    section: string;
    isActive: boolean;
    onClick: () => void;
}

export interface EnvironmentalCardProps {
    icon: any;
    backgroundColor: string;
    borderColor: string;
    children: React.ReactNode;
}

// Animation variants that are shared between components
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

export const fadeInVariant: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.6
        }
    }
};

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