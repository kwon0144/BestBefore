import LocationInput from "./LocationInput";
import SubmitButton from "./SubmitButton";
import { Dispatch, SetStateAction, useState } from "react";
import { useGeocoding } from "@/hooks/useGeocoding";
import CurrentLocationButton from "./CurrentLocationButton";
import { useFoodBankName } from "@/hooks/useFoodBank";
import TravelModeSelection from "./TravelModeSelection";
import { Button } from "@heroui/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

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
    setShowInformation: Dispatch<SetStateAction<boolean>>;
}

export default function Navigation({ 
    selectedStart, selectedEnd, setSelectedStart, 
    setRouteStart, setRouteEnd, showNavigation, 
    setShowNavigation, setShowRouteResult, setTravellingMode,
    setShowInformation
}: NavigationProps) {
    const currentAddress = useGeocoding(selectedStart);
    const selectedFoodBank = useFoodBankName(selectedEnd);
    const [selectedMode, setSelectedMode] = useState("WALKING");
    const [currentLocationAddress, setCurrentLocationAddress] = useState<string>("");

    const handleBackToInfo = () => {
        setShowNavigation(false);
        setShowInformation(true);
    }

    return (
        <div className={`h-full flex flex-col pl-10 w-full ${showNavigation ? "display" : "hidden"}`}>
            <div className="mb-2">
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
                <div className="mb-3">
                    <h2 className="text-2xl font-bold text-darkgreen mb-3">
                    {selectedFoodBank}
                    </h2>
                    <div className="flex items-start mb-6">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600 mt-1 mr-3 w-5"></FontAwesomeIcon>
                    <p className="text-gray-700">123 Main Street, Melbourne, VIC 3000</p>
                    </div>
                </div>
                {/* Navigation Starting Point */}
                <div className="mb-6">
                  <label
                    htmlFor="starting-point"
                    className="block text-lg font-semibold mb-2 text-gray-700"
                  >
                    Enter your starting point:
                  </label>
                  <div className="relative">
                        <div className="flex flex-row gap-2">
                            <LocationInput 
                                setSelectedStart={setSelectedStart} 
                                currentLocationAddress={currentLocationAddress}
                            />
                            <CurrentLocationButton 
                                setSelectedStart={setSelectedStart} 
                                onLocationFound={setCurrentLocationAddress}
                            />
                        </div>
                  </div>
                </div>
                {/* Navigation Travelling Mode */}
                <div className="mb-8">
                    <TravelModeSelection setSelectedMode={setSelectedMode} />
                </div>
                {/* Submit Navigation Setting */}
                <div className="mt-auto">
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
            </div>
        </div>
    );
}