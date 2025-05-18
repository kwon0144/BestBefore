/**
 * GlobalImpact interfaces for the food waste visualization around the world
 * Provides types for the data structures used in the global food waste map and charts
 */

/**
 * Properties for the GlobalImpact component
 */
export interface GlobalImpactProps {
  setRef: (node: HTMLDivElement | null) => void;
}

/**
 * Represents food waste data for a single country
 */
export interface CountryData {
  country: string;                     // Country name
  total_economic_loss: number;         // Economic loss in dollars
  population: number;                  // Country population
  household_waste_percentage: number;  // Percentage of waste from households
  annual_cost_per_household: number;   // Annual cost per household in dollars
  total_waste?: number;                // Total waste in tonnes (optional)
}

/**
 * Response structure for global food waste data
 */
export interface GlobalWasteData {
  summary: {
    total_economic_loss: number;       // Global economic loss
    total_waste: number;               // Global waste in tonnes
    economic_loss_per_ton?: number;    // Economic loss per tonne (optional)
    avg_household_waste_percentage?: number; // Average household waste percentage (optional)
  };
  countries: CountryData[];            // Array of country-specific data
  cache?: boolean;                     // Indicates if data came from cache
  updated_at: string;                  // Last update timestamp
}

/**
 * Structure for storing yearly data by country
 */
export interface YearlyCountryData {
  [country: string]: {                 // Country name as key
    [year: number]: {                  // Year as key
      total_waste: number;             // Total waste for this country/year
      total_economic_loss: number;     // Economic loss for this country/year
      household_waste_percentage: number; // Household waste percentage for this country/year
    }
  }
}

/**
 * Represents a single data point for a country in a specific year
 */
export interface CountryYearlyData {
  year: number;                        // Year of data
  country: string;                     // Country name
  total_waste: number;                 // Total waste in tonnes
  economic_loss: number;               // Economic loss in dollars
  household_waste_percentage: number;  // Percentage of waste from households
}

/**
 * API response structure for yearly data
 */
export interface ApiYearlyResponse {
  count: number;                       // Number of records
  data: CountryYearlyData[];           // Array of country yearly data
  cache?: boolean;                     // Indicates if data came from cache
  updated_at: string;                  // Last update timestamp
}

/**
 * Type for accessing data values from country data
 */
export type DataAccessor = (d: CountryData) => number;

/**
 * Indicator configuration for the map
 */
export interface IndicatorConfig {
  id: string;                          // Identifier for the indicator
  name: string;                        // Display name for the indicator
  colorScale: any;                     // D3 color scale for the indicator
} 