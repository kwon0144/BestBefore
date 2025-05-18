/**
 * Simple card data interface for displaying food waste statistics
 */
export interface CardInfo {
    country: string;
    value: number;
    percentage: number;
    color: string;
}

/**
 * Represents a single food type in the waste composition breakdown
 * Used for pie/bar charts showing waste by food category
 */
export interface FoodWasteItem {
    name: string;        // Food category name (e.g., "Fruits & Vegetables")
    value: number;       // Amount in tonnes
    percentage: number;  // Percentage of total waste
    color?: string;      // Color code for visualization
}

/**
 * API response for food waste composition data
 * Used to show the breakdown of waste by food type
 */
export interface FoodWasteCompositionResponse {
    total_tonnes: number;       // Total food waste in tonnes
    data: FoodWasteItem[];      // Breakdown by food category
    updated_at: string;         // Last updated timestamp
}

/**
 * Represents waste distribution across different sectors
 * Used for visualizing waste by source (household, retail, etc.)
 */
export interface FoodWasteCategory {
    category: string;           // Sector name (e.g., "Household", "Retail")
    total_waste: number;        // Amount in tonnes
    economic_loss: number;      // Financial impact in dollars
    percentage: number;         // Percentage of total waste
    color?: string;             // Color code for visualization
}

/**
 * API response for food waste by category/sector
 * Shows how waste is distributed across the food supply chain
 */
export interface FoodWasteByCategoryResponse {
    total_waste: number;                 // Total food waste in tonnes
    categories: FoodWasteCategory[];     // Breakdown by sector
    filters: {
        year: string;                   // Year of the data
        country: string;                // Country code or name
    };
    updated_at: string;                  // Last updated timestamp
} 