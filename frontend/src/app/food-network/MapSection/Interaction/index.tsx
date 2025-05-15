/**
 * Interaction Component
 * 
 * This component serves as a container for different interaction modes in the food network map section.
 * It conditionally renders different subcomponents based on the current view state:
 * - Information: Displays details about selected locations
 * - Navigation: Handles route planning and navigation
 * - RouteResult: Shows the calculated route results
 */

import { Dispatch, SetStateAction } from "react";
import Navigation from "./Navigation";
import Information from "./Information";
import RouteResult from "./RouteResult";
import { MapSectionState, ViewState } from "../../interfaces";

/**
 * Props interface for the Interaction component
 * @interface InteractionProps
 * @property {MapSectionState} mapSectionState - Current state of the map section
 * @property {Dispatch<SetStateAction<MapSectionState>>} setMapSectionState - Function to update map section state
 * @property {ViewState} viewState - Current view state determining which subcomponent to show
 * @property {Dispatch<SetStateAction<ViewState>>} setViewState - Function to update view state
 * @property {string} selectedType - Currently selected type of location or route
 */

interface InteractionProps {
    mapSectionState: MapSectionState;
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>;
    viewState: ViewState;
    setViewState: Dispatch<SetStateAction<ViewState>>;
    selectedType: string;       
}

/**
 * Main Interaction component that manages different interaction modes in the food network map
 * @param {InteractionProps} props - Component props
 * @returns {JSX.Element} Rendered component with conditional subcomponents
 */
export default function Interaction({ 
    mapSectionState, setMapSectionState, viewState, setViewState, selectedType
}: InteractionProps) {
    return (
        <>
            {/* Render Information component when showInformation is true */}
            {viewState.showInformation && (
                <Information 
                    mapSectionState={mapSectionState}
                    setViewState={setViewState}
                />
            )}
            {/* Render Navigation component when showNavigation is true */}
            {viewState.showNavigation && (
                <Navigation 
                    mapSectionState={mapSectionState}
                    setMapSectionState={setMapSectionState}
                    setViewState={setViewState}
                />
            )}
            {/* Render RouteResult component when showRouteResult is true */}
            {viewState.showRouteResult && (
                <RouteResult 
                    mapSectionState={mapSectionState}
                    setViewState={setViewState}
                    selectedType={selectedType}
                />
            )}
        </>
    )
}