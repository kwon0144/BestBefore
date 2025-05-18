/**
 * Second Life Items Interfaces
 * 
 * This file defines the types and interfaces related to the Second Life feature, which helps users
 * discover how to repurpose food waste into useful products.
 * 
 * These interfaces are used throughout the application to ensure type safety and provide
 * consistent data structures for components handling Second Life items.
 */

/**
 * Interface for items from the diy_projects database
 * Represents a single DIY project or method for repurposing food waste
 */
export interface SecondLifeItem {
    method_id: number;
    method_name: string;
    is_combo: boolean;
    method_category: string;
    ingredient: string;
    description: string;
    picture: string;
}