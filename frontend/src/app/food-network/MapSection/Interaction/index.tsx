import { Dispatch, SetStateAction } from "react";
import Navigation from "./Navigation";
import Information from "./Information";
import RouteResult from "./RouteResult";
import { TravelMode } from "./Navigation/TravelModeSelection";

interface InteractionProps {
    selectedEnd: string | null;
    selectedStart: {lat: number, lng: number} | null;
    setSelectedStart: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    setRouteStart: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    setRouteEnd: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    routeDetails: {duration: string, distance: string};
    travellingMode: TravelMode;
    setTravellingMode: Dispatch<SetStateAction<TravelMode>>;
    viewState: {showInformation: boolean, showNavigation: boolean, showRouteResult: boolean};
    setViewState: Dispatch<SetStateAction<{showInformation: boolean, showNavigation: boolean, showRouteResult: boolean}>>;
    selectedType: string;
    currentLocationAddress: string | null;
    setCurrentLocationAddress: Dispatch<SetStateAction<string | null>>;
}
export default function Interaction({ 
    selectedEnd, selectedStart, setSelectedStart, 
    setRouteStart, setRouteEnd, routeDetails, travellingMode,
    setTravellingMode, viewState, setViewState, selectedType,
    currentLocationAddress, setCurrentLocationAddress
}: InteractionProps) {
    return (
        <>
            {viewState.showInformation && (
                <Information 
                    selectedEnd={selectedEnd}
                    setViewState={setViewState}
                    selectedType={selectedType}
                />
            )}
            {viewState.showNavigation && (
                <Navigation 
                    selectedStart={selectedStart}
                    selectedEnd={selectedEnd}
                    setSelectedStart={setSelectedStart}
                    setRouteStart={setRouteStart}
                    setRouteEnd={setRouteEnd}
                    setViewState={setViewState}
                    setTravellingMode={setTravellingMode}
                    currentLocationAddress={currentLocationAddress}
                    setCurrentLocationAddress={setCurrentLocationAddress}
                />
            )}
            {viewState.showRouteResult && (
                <RouteResult 
                    selectedEnd={selectedEnd}
                    selectedStart={selectedStart}
                    setViewState={setViewState}
                    routeDetails={routeDetails}
                    setRouteStart={setRouteStart}
                    setRouteEnd={setRouteEnd}
                    travellingMode={travellingMode}
                />
            )}
        </>
    )
}