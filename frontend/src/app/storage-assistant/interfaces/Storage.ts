// Storage related interfaces

/**
 * Interface for storage recommendation including fridge and pantry items
 */
export interface StorageRecommendation {
    fridge: Array<{
        name: string;
        quantity: number;
    }>;
    pantry: Array<{
        name: string;
        quantity: number;
    }>;
}