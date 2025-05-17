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