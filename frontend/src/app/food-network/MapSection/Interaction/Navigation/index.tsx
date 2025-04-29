import LocationInput from "./LocationInput";
import SubmitButton from "./SubmitButton";
import { Dispatch, SetStateAction, useState } from "react";
import CurrentLocationButton from "./CurrentLocationButton";
import { useFoodBank } from "@/hooks/useFoodBank";
import TravelModeSelection from "./TravelModeSelection";
import { Button } from "@heroui/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMapPin } from '@fortawesome/free-solid-svg-icons';
import { useMap } from "@vis.gl/react-google-maps";
import { MapSectionState } from "../../../interfaces";

interface NavigationProps {
    mapSectionState: MapSectionState;
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>;
    setViewState: Dispatch<SetStateAction<{showInformation: boolean, showNavigation: boolean, showRouteResult: boolean}>>;
}

export default function Navigation({
    mapSectionState, setMapSectionState, setViewState
}: NavigationProps) {
    const { foodbank } = useFoodBank(mapSectionState.selectedEnd);
    const [error, setError] = useState<string>("");

    const map = useMap();

    const handleBackToInfo = () => {
        setViewState(prev => ({...prev, showInformation: true, showNavigation: false, showRouteResult:false }))
        setMapSectionState(prev => ({
            ...prev,
            selectedStart: null
        }))
        if (map && mapSectionState.selectedStart) {
            map.setZoom(12);
        }
    }

    return (
        <div className="flex flex-col md:pl-1 lg:pl-10 w-full">
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
            <div className="mb-5">
                <label
                    htmlFor="starting-point"
                    className="block text-lg font-semibold mb-2 text-gray-700"
                    >
                    Enter your starting point:
                </label>
                <div className="flex flex-row">
                    <LocationInput
                        mapSectionState={mapSectionState}
                        setMapSectionState={setMapSectionState}
                    />
                    <CurrentLocationButton
                        setMapSectionState={setMapSectionState}
                    />
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            {/* Travel Mode Selection */}
            <div className="mb-8">
                <TravelModeSelection
                    mapSectionState={mapSectionState}
                    setMapSectionState={setMapSectionState}
                />
            </div>
            {/* Submit Button */}
            <div className="mb-3">
                <SubmitButton
                    setViewState={setViewState}
                    mapSectionState={mapSectionState}
                    setMapSectionState={setMapSectionState}
                    setError={setError}
                />
            </div>
        </div>
    );
}