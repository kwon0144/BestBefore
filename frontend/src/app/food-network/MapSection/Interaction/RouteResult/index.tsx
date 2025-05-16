/**
 * RouteResult Component
 * 
 * This component displays the results of a route calculation between a starting point and a food bank/green waste bin.
 * It shows route details including start/end points, travel mode, estimated time, and distance.
 * Users can navigate back to the previous view or choose a different destination.
 */

import { useFoodBankById } from "@/app/food-network/hooks/useFoodBanks";
import { useGeocoding } from "@/app/food-network/hooks/useGeocoding";
import { Button } from "@heroui/react";
import { Dispatch, SetStateAction } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { faRoad, faClock, faMapPin, faWalking, faBicycle, faBus, faCar, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MapSectionState } from "@/app/food-network/interfaces/State";

/**
 * Props interface for the RouteResult component
 * @property mapSectionState - Current state of the map section
 * @property setViewState - Function to update the view state
 * @property selectedType - Type of destination (Food Donation Points or Green Waste Bins)
 */
interface RouteResultProps {
    mapSectionState: MapSectionState;
    setViewState: Dispatch<SetStateAction<{showInformation: boolean, showNavigation: boolean, showRouteResult: boolean}>>;
    selectedType: string;
}

export default function RouteResult({ 
    mapSectionState, 
    setViewState,
    selectedType
}: RouteResultProps) {
    const map = useMap();

    // Get the formatted address for the starting point
    const startAddress = useGeocoding(mapSectionState.selectedStart);
    // Get the selected food bank details
    const { foodbank: selectedFoodBank } = useFoodBankById(mapSectionState.selectedEnd);

    // Handle click to return to information view and reset map
    const handleClick = () => {
        setViewState(prev => ({...prev, showRouteResult: false, showInformation: true}));
        if (map) {
            map.setZoom(12);
            
            // Center on the selected food bank/green waste bin
            if (selectedFoodBank && selectedFoodBank.latitude && selectedFoodBank.longitude) {
                map.setCenter({
                    lat: selectedFoodBank.latitude,
                    lng: selectedFoodBank.longitude
                });
            }
        }
    }

    // Handle navigation back to the previous view
    const handleBackToNavigation = () => {
        setViewState(prev => ({...prev, showRouteResult: false, showNavigation: true}));
        if (map && mapSectionState.selectedStart) {
            map.setZoom(12);
            // Center on the selected food bank/green waste bin
            if (selectedFoodBank && selectedFoodBank.latitude && selectedFoodBank.longitude) {
                map.setCenter({
                    lat: selectedFoodBank.latitude,
                    lng: selectedFoodBank.longitude
                });
            }
        }
    }

    return (
        <div className="flex flex-col md:pl-1 lg:pl-10 w-full">
            {/* Navigation Back Button */}
            <div className="mb-3">
                <Button
                    onPress={handleBackToNavigation}
                    className="text-darkgreen flex items-center cursor-pointer whitespace-nowrap bg-transparent p-0"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Back to Navigation
                </Button>
            </div>
            {/* Route Details Section */}
            <div className="border-2 border-gray-400 rounded-lg px-6 py-5 mb-6 shadow-sm">
                {/* Starting Point Display */}
                <div className="mb-3 md:hidden xl:block">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                        FROM
                    </h3>
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-lightgreen flex items-center justify-center">
                            <FontAwesomeIcon icon={faMapPin} className="text-green-700" />
                        </div>
                        <p className="font-medium break-words">{startAddress}</p>
                    </div>
                </div>
                {/* Travel Mode Display */}
                <div className="pl-5 ml-[0.625rem] border-l-2 border-dashed border-gray-400 py-2 md:hidden xl:block">
                    <div className="flex items-center text-gray-600">
                    {mapSectionState.travellingMode === "WALKING"
                        ? <FontAwesomeIcon icon={faWalking} className="mr-2" />
                        : mapSectionState.travellingMode === "BICYCLING"
                            ? <FontAwesomeIcon icon={faBicycle} className="mr-2" />
                            : mapSectionState.travellingMode === "TRANSIT"
                            ? <FontAwesomeIcon icon={faBus} className="mr-2" />
                            : <FontAwesomeIcon icon={faCar} className="mr-2" />
                    }
                    <span>via {mapSectionState.travellingMode}</span>
                    </div>
                </div>
                {/* Destination Display */}
                <div className="mt-3 md:mt-0 xl:mt-3">
                    <h3 className="text-sm font-medium text-gray-600 mb-1 md:hidden xl:block">
                        TO
                    </h3>
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-lightgreen flex items-center justify-center mr-3">
                    <FontAwesomeIcon icon={faMapPin} className="text-green-700" />
                    </div>
                    <div className="flex flex-col">
                    <p className="font-medium">{selectedFoodBank?.name}</p>
                    <p className="text-sm text-gray-600">
                        {selectedFoodBank?.address}
                    </p>
                    </div>
                    </div>
                </div>
            </div>
            {/* Route Estimation Cards */}
            <div className="grid grid-cols-2 grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
                {/* Estimated Time Card */}
                <div className="bg-gray-200/80 rounded-lg p-4 shadow-sm border border-green-200">
                    <h3 className="text-sm font-medium text-darkgreen mb-2">
                      ESTIMATED TIME
                    </h3>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faClock} className="mr-2 text-green" />
                      <p className="text-md font-bold text-darkgreen">
                        {mapSectionState.routeDetails.duration}
                      </p>
                    </div>
                  </div>
                  {/* Estimated Distance Card */}
                  <div className="bg-gray-200/80 rounded-lg p-4 shadow-sm border border-green-200">
                    <h3 className="text-sm font-medium text-darkgreen mb-2">
                      ESTIMATED DISTANCE
                    </h3>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faRoad} className="mr-2 text-green" />
                      <p className="text-md font-bold text-darkgreen">
                        {mapSectionState.routeDetails.distance}
                      </p>
                    </div>
                </div>
            </div>
            {/* Action Button */}
            <Button 
                onPress={() => {handleClick()}}
                className="bg-darkgreen hover:bg-darkgreen/50 text-white font-bold py-2 px-4 rounded-lg"
            >
                {selectedType === "Food Donation Points" ? "Choose another Food Bank" : "Choose another Green Waste Bin"}
            </Button>
        </div>
    )
}