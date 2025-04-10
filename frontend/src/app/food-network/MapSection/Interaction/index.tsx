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
    showInformation: boolean;
    showNavigation: boolean;
    showRouteResult: boolean;
    setShowInformation: Dispatch<SetStateAction<boolean>>;
    setShowNavigation: Dispatch<SetStateAction<boolean>>;
    setShowRouteResult: Dispatch<SetStateAction<boolean>>;
    selectedType: string;
    currentLocationAddress: string | null;
    setCurrentLocationAddress: Dispatch<SetStateAction<string | null>>;
}
export default function Interaction({ 
    selectedEnd, selectedStart, setSelectedStart, 
    setRouteStart, setRouteEnd, routeDetails, travellingMode,
    setTravellingMode, showInformation, showNavigation, showRouteResult,
    setShowInformation, setShowNavigation, setShowRouteResult, selectedType,
    currentLocationAddress, setCurrentLocationAddress
}: InteractionProps) {
    return (
        <>
            <Information 
                selectedEnd={selectedEnd}
                setShowInformation={setShowInformation}
                setShowNavigation={setShowNavigation}
                showInformation={showInformation}
                selectedType={selectedType}
            />
            {showNavigation && (
                <Navigation 
                    selectedStart={selectedStart}
                    selectedEnd={selectedEnd}
                    setSelectedStart={setSelectedStart}
                    setRouteStart={setRouteStart}
                    setRouteEnd={setRouteEnd}
                    showNavigation={showNavigation}
                    setShowNavigation={setShowNavigation}
                    setShowRouteResult={setShowRouteResult}
                    setShowInformation={setShowInformation}
                    setTravellingMode={setTravellingMode}
                    currentLocationAddress={currentLocationAddress}
                    setCurrentLocationAddress={setCurrentLocationAddress}
                />
            )}
            <RouteResult 
                selectedEnd={selectedEnd}
                selectedStart={selectedStart}
                showRouteResult={showRouteResult}
                setShowRouteResult={setShowRouteResult}
                setShowInformation={setShowInformation}
                setShowNavigation={setShowNavigation}
                routeDetails={routeDetails}
                setRouteStart={setRouteStart}
                setRouteEnd={setRouteEnd}
                travellingMode={travellingMode}
            />
        </>
    )
}