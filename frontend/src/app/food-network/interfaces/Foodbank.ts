/**
 * Foodbank Interfaces
 * 
 * This file defines the types and interfaces related to foodbanks and green waste disposal points.
 * These interfaces are used throughout the application to ensure type safety when working with
 * foodbank data fetched from the backend API.
 */

/**
 * Daily schedule information for a food bank
 * Represents whether a facility is open on a specific day and its operating hours
 */
export type DailySchedule = {
    is_open: boolean;
    hours: string | null;
};

/**
 * Detailed operation schedule for a food bank
 * Contains information about operating hours, days of operation,
 * and daily schedule broken down by each day of the week
 */
export type OperationSchedule = {
    is_24_hours: boolean;
    days: string[];
    hours: string;
    raw_text: string;
    daily_schedule: {
        monday: DailySchedule;
        tuesday: DailySchedule;
        wednesday: DailySchedule;
        thursday: DailySchedule;
        friday: DailySchedule;
        saturday: DailySchedule;
        sunday: DailySchedule;
    };
};

/**
 * Main foodbank entity type
 * Represents a food bank or green waste disposal point with all its attributes
 * including location, operating hours, and type information
 */
export type Foodbank = {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    type: string;
    hours_of_operation: string;
    address: string;
    operation_schedule: OperationSchedule;
};

/**
 * API response format for foodbank data
 * Used when fetching foodbank data from the backend
 */
export type FoodbankResponse = {
    status: string;
    count: number;
    data: Foodbank[];
};