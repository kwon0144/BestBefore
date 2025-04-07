import { Dispatch, SetStateAction, useState } from "react";
import Navigation from "./Navigation";
import Information from "./Information";
import RouteResult from "./RouteResult";

interface InteractionProps {
    selectedEnd: string | null;
    selectedStart: {lat: number, lng: number} | null;
    setSelectedStart: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    setRouteStart: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    setRouteEnd: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    routeDetails: {duration: string, distance: string};
    setTravellingMode: Dispatch<SetStateAction<string>>;
}
export default function Interaction({ 
    selectedEnd, selectedStart, setSelectedStart, 
    setRouteStart, setRouteEnd, routeDetails, 
    setTravellingMode 
}: InteractionProps) {
    const [showInformation, setShowInformation] = useState(true);
    const [showNavigation, setShowNavigation] = useState(false);
    const [showRouteResult, setShowRouteResult] = useState(false);

    return (
        <>
            <Information 
                selectedEnd={selectedEnd}
                setShowInformation={setShowInformation}
                setShowNavigation={setShowNavigation}
                showInformation={showInformation}
            />
            <Navigation 
                selectedStart={selectedStart}
                selectedEnd={selectedEnd}
                setSelectedStart={setSelectedStart}
                setRouteStart={setRouteStart}
                setRouteEnd={setRouteEnd}
                showNavigation={showNavigation}
                setShowNavigation={setShowNavigation}
                setShowRouteResult={setShowRouteResult}
                setTravellingMode={setTravellingMode}
                setShowInformation={setShowInformation}
            />
            <RouteResult 
                selectedEnd={selectedEnd}
                selectedStart={selectedStart}
                setSelectedStart={setSelectedStart}
                showRouteResult={showRouteResult}
                setShowRouteResult={setShowRouteResult}
                setShowInformation={setShowInformation}
                routeDetails={routeDetails}
                setRouteStart={setRouteStart}
                setRouteEnd={setRouteEnd}
            />
        </>
    )
}