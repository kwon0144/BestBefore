/**
 * Interface definitions for reusable components in the food waste visualization
 * These types specify the required props and data structures for UI components
 */

/**
 * Supply chain stage component data structure
 * Represents a single stage in the food supply chain visualization
 */
export interface SupplyChainStage {
    icon: any;                 // Icon component or element
    name: string;              // Stage name (e.g., "Production", "Distribution")
    description: string;       // Description of this supply chain stage
    colorClass: string;        // Tailwind color class for background
    borderColorClass: string;  // Tailwind color class for border
}

/**
 * Props for the MetricCard component
 * Displays a single metric with visual indicators for change
 */
export interface MetricCardProps {
    icon: any;                 // Icon component or element 
    title: string;             // Metric title
    value: number;             // Current value of the metric
    unit: string;              // Unit of measurement (e.g., "tonnes", "kg")
    changePercent: number;     // Percentage change from previous period
    isIncrease: boolean;       // Whether the change is an increase (true) or decrease (false)
    fillPercent: number;       // Percentage to fill the progress bar (0-100)
    color: string;             // Color for the card's accents
}

/**
 * Props for the ProgressNavItem component
 * Used in navigation that shows the current progress/section
 */
export interface ProgressNavItemProps {
    icon: any;                 // Icon component or element
    section: string;           // Section name
    isActive: boolean;         // Whether this section is currently active
    onClick: () => void;       // Handler for when this nav item is clicked
}

/**
 * Props for the EnvironmentalCard component
 * Card that displays environmental impact information
 */
export interface EnvironmentalCardProps {
    icon: any;                 // Icon component or element
    backgroundColor: string;   // Background color for the card
    borderColor: string;       // Border color for the card
    children: React.ReactNode; // Card content
} 