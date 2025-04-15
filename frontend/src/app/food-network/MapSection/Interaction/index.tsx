import { Dispatch, SetStateAction } from "react";
import Navigation from "./Navigation";
import Information from "./Information";
import RouteResult from "./RouteResult";
import { MapSectionState, ViewState } from "../../interfaces";

interface InteractionProps {
    mapSectionState: MapSectionState;
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>;
    viewState: ViewState;
    setViewState: Dispatch<SetStateAction<ViewState>>;
    selectedType: string;       
}

export default function Interaction({ 
    mapSectionState, setMapSectionState, viewState, setViewState, selectedType
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