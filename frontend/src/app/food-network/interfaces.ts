export interface ViewState {
    showInformation: boolean;
    showNavigation: boolean;
    showRouteResult: boolean;
}

export type TravelMode = "WALKING" | "TRANSIT" | "BICYCLING" | "DRIVING";

export interface MapSectionState {
    selectedEnd: string | null;
    selectedStart: { lat: number, lng: number } | null;
    routeStart: { lat: number, lng: number } | null;
    routeEnd: { lat: number, lng: number } | null;
    routeDetails: { duration: string, distance: string };
    travellingMode: TravelMode;
}
