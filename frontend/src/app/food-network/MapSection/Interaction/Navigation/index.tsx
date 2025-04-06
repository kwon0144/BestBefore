import LocationInput from "./LocationInput";
import SubmitButton from "./SubmitButton";
import { Dispatch, SetStateAction, useState } from "react";
import { useGeocoding } from "@/hooks/useGeocoding";
import CurrentLocationButton from "./CurrentLocationButton";
import { useFoodBankName } from "@/hooks/useFoodBank";
import TravelModeSelection from "./TravelModeSelection";

interface NavigationProps {
    selectedStart: {lat: number, lng: number} | null;
    selectedEnd: string | null;
    setSelectedStart: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    setRouteStart: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    setRouteEnd: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    showNavigation: boolean;
    setShowNavigation: Dispatch<SetStateAction<boolean>>;
    setShowRouteResult: Dispatch<SetStateAction<boolean>>;
    setTravellingMode: Dispatch<SetStateAction<string>>;
}

export default function Navigation({ 
    selectedStart, selectedEnd, setSelectedStart, 
    setRouteStart, setRouteEnd, showNavigation, 
    setShowNavigation, setShowRouteResult, setTravellingMode 
}: NavigationProps) {
    const currentAddress = useGeocoding(selectedStart);
    const selectedFoodBank = useFoodBankName(selectedEnd);
    const [selectedMode, setSelectedMode] = useState("WALKING");

    return (
        <>
            <div className={`flex flex-col gap-4 pl-10 w-full ${showNavigation ? "display" : "hidden"}`}>
                <p className="font-semibold">Find a route from: </p>
                <div className="flex flex-col gap-3">
                    <CurrentLocationButton setSelectedStart={setSelectedStart} />
                    <p className="text-sm text-black self-center">Or</p>
                    <LocationInput setSelectedStart={setSelectedStart} />
                </div>
                <p className="font-semibold">From: </p>
                <p>{selectedStart ? currentAddress : "select a start location"}</p>
                <p className="font-semibold">To: </p>
                <p>{selectedFoodBank}</p>
                {/* Select Travelling Mode */}
                <TravelModeSelection setSelectedMode={setSelectedMode} />
                {/* Submit Navigation Setting */}
                <SubmitButton 
                    selectedStart={selectedStart} 
                    selectedEnd={selectedEnd} 
                    setRouteStart={setRouteStart} 
                    setRouteEnd={setRouteEnd} 
                    setShowNavigation={setShowNavigation} 
                    setShowRouteResult={setShowRouteResult} 
                    selectedMode={selectedMode}
                    setTravellingMode={setTravellingMode}
                />
            </div>
        </>
    );
}