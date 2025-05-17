// Animation Variants
import { Variants } from "framer-motion";

export interface CardInfo {
    country: string;
    value: number;
    percentage: number;
    color: string;
}

// Food waste composition data interface
export interface FoodWasteItem {
    name: string;
    value: number;
    percentage: number;
    color?: string;
}

export interface FoodWasteCompositionResponse {
    total_tonnes: number;
    data: FoodWasteItem[];
    updated_at: string;
}

// Food waste by category data interface
export interface FoodWasteCategory {
    category: string;
    total_waste: number;
    economic_loss: number;
    percentage: number;
    color?: string;
}

export interface FoodWasteByCategoryResponse {
    total_waste: number;
    categories: FoodWasteCategory[];
    filters: {
        year: string;
        country: string;
    };
    updated_at: string;
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