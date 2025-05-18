/**
 * Interface for the view state of the application
 * Represents the visibility of different sections of the UI
 */
export interface ViewState {
    showInformation: boolean;
    showNavigation: boolean;
    showRouteResult: boolean;
}

/**
 * Type for the travel mode of the application
 * Represents the mode of transportation used for routing
 */
export type TravelMode = "WALKING" | "TRANSIT" | "BICYCLING" | "DRIVING";

/**
 * Interface for the map section state of the application
 * 
 */
export interface MapSectionState {
    selectedEnd: string | null;
    selectedStart: { lat: number, lng: number } | null;
    routeStart: { lat: number, lng: number } | null;
    routeEnd: { lat: number, lng: number } | null;
    routeDetails: { duration: string, distance: string };
    travellingMode: TravelMode;
    currentLocationAddress: string;
}
