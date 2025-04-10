import LocationInput from "./LocationInput";
import SubmitButton from "./SubmitButton";
import { Dispatch, SetStateAction, useState } from "react";
import CurrentLocationButton from "./CurrentLocationButton";
import { useFoodBank } from "@/hooks/useFoodBank";
import TravelModeSelection, { TravelMode } from "./TravelModeSelection";
import { Button } from "@heroui/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMapPin } from '@fortawesome/free-solid-svg-icons';
import { useMap } from "@vis.gl/react-google-maps";

interface NavigationProps {
    selectedStart: {lat: number, lng: number} | null;
    selectedEnd: string | null;
    setSelectedStart: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    setRouteStart: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    setRouteEnd: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    showNavigation: boolean;
    setShowNavigation: Dispatch<SetStateAction<boolean>>;
    setShowRouteResult: Dispatch<SetStateAction<boolean>>;
    setShowInformation: Dispatch<SetStateAction<boolean>>;
    setTravellingMode: Dispatch<SetStateAction<TravelMode>>;
    currentLocationAddress: string | null;
    setCurrentLocationAddress: Dispatch<SetStateAction<string | null>>;
}

export default function Navigation({
    selectedStart,
    selectedEnd,
    setSelectedStart,
    setRouteStart,
    setRouteEnd,
    showNavigation,
    setShowNavigation,
    setShowRouteResult,
    setShowInformation,
    setTravellingMode,
    currentLocationAddress,
    setCurrentLocationAddress,
}: NavigationProps) {
    const { foodbank } = useFoodBank(selectedEnd);
    const [selectedMode, setSelectedMode] = useState<TravelMode>("WALKING");
    const [error, setError] = useState<string>("");

    const map = useMap();

    const handleBackToInfo = () => {
        setShowNavigation(false);
        setShowInformation(true);
        if (map && selectedStart) {
            map.setZoom(12);
            map.setCenter({lat: -37.8136, lng: 144.9631});
        }
    }

    return (
        <div className={`h-full flex flex-col pl-10 w-full ${showNavigation ? "display" : "hidden"}`}>
            {/* Navigation Back Button */}
            <div className="mb-3">
                <Button
                    onPress={handleBackToInfo}
                    className="text-darkgreen flex items-center cursor-pointer whitespace-nowrap bg-transparent p-0"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Back to Information
                </Button>
            </div>
            {/* Navigation Target Food Bank */}
            <div className="bg-gray-200/80 rounded-lg p-6 mb-6 shadow-sm mb-10 min-h-[110px]">   
                <div className="flex items-center h-full">      
                    <div className="w-10 h-10 rounded-full bg-lightgreen flex items-center justify-center mr-3">
                    <FontAwesomeIcon icon={faMapPin} className="text-green-700" />
                    </div>
                    <div className="flex flex-col">
                    <p className="text-xl font-bold text-darkgreen">{foodbank?.name}</p>
                    <p className="text-sm text-gray-600">
                        {foodbank?.address}
                    </p>
                    </div>
                </div>
            </div>
            {/* Location Input */}
            <div className="mb-10">
                <label
                    htmlFor="starting-point"
                    className="block text-lg font-semibold mb-2 text-gray-700"
                    >
                    Enter your starting point:
                </label>
                <div className="flex flex-row">
                    <LocationInput
                        setSelectedStart={setSelectedStart}
                        currentLocationAddress={currentLocationAddress}
                        setCurrentLocationAddress={setCurrentLocationAddress}
                    />
                    <CurrentLocationButton
                        setSelectedStart={setSelectedStart}
                        onLocationFound={setCurrentLocationAddress}
                    />
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            {/* Travel Mode Selection */}
            <div className="mb-10">
                <TravelModeSelection
                    selectedMode={selectedMode}
                    setSelectedMode={setSelectedMode}
                />
            </div>
            {/* Submit Button */}
            <div className="mb-3">
                <SubmitButton
                    selectedStart={selectedStart}
                    selectedEnd={selectedEnd}
                    setRouteStart={setRouteStart}
                    setRouteEnd={setRouteEnd}
                    setShowNavigation={setShowNavigation}
                    setShowRouteResult={setShowRouteResult}
                    selectedMode={selectedMode}
                    setTravellingMode={setTravellingMode}
                    setError={setError}
                />
            </div>
        </div>
    );
}