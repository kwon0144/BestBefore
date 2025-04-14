import { Dispatch, SetStateAction } from "react";
import Navigation from "./Navigation";
import Information from "./Information";
import RouteResult from "./RouteResult";
import { MapSectionState, ViewState } from "../../page";

interface InteractionProps {
    mapSectionState: MapSectionState;
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>;
    viewState: ViewState;
    setViewState: Dispatch<SetStateAction<ViewState>>;
    selectedType: string;
    currentLocationAddress: string | null;
    setCurrentLocationAddress: Dispatch<SetStateAction<string | null>>;
}

export default function Interaction({ 
    mapSectionState, setMapSectionState, viewState, setViewState, selectedType, currentLocationAddress, setCurrentLocationAddress
}: InteractionProps) {
    return (
        <>
            {viewState.showInformation && (
                <Information 
                    mapSectionState={mapSectionState}
                    setViewState={setViewState}
                />
            )}
            {viewState.showNavigation && (
                <Navigation 
                    mapSectionState={mapSectionState}
                    setMapSectionState={setMapSectionState}
                    setViewState={setViewState}
                    currentLocationAddress={currentLocationAddress}
                    setCurrentLocationAddress={setCurrentLocationAddress}
                />
            )}
            {viewState.showRouteResult && (
                <RouteResult 
                    mapSectionState={mapSectionState}
                    setMapSectionState={setMapSectionState}
                    setViewState={setViewState}
                    selectedType={selectedType}
                />
            )}
        </>
    )
}