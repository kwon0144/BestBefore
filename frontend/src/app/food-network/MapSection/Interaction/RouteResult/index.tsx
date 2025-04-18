import { useFoodBank } from "@/hooks/useFoodBank";
import { useGeocoding } from "@/hooks/useGeocoding";
import { Button } from "@heroui/react";
import { Dispatch, SetStateAction } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { faRoad, faClock, faMapPin, faWalking, faBicycle, faBus, faCar, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MapSectionState } from "@/app/food-network/interfaces";

interface RouteResultProps {
    mapSectionState: MapSectionState;
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>;
    setViewState: Dispatch<SetStateAction<{showInformation: boolean, showNavigation: boolean, showRouteResult: boolean}>>;
    selectedType: string;
}

export default function RouteResult({ 
    mapSectionState, 
    setMapSectionState,
    setViewState,
    selectedType
}: RouteResultProps) {
    const map = useMap();

    const handleClick = () => {
        setViewState(prev => ({...prev, showRouteResult: false, showInformation: true}));
        if (map) {
            map.setZoom(12);
            map.setCenter({lat: -37.8136, lng: 144.9631});
        }
    }

    const handleBackToNavigation = () => {
        setViewState(prev => ({...prev, showRouteResult: false, showNavigation: true}));
        setMapSectionState(prev => ({...prev, selectedStart: null, currentLocationAddress: ""}));
        if (map && mapSectionState.selectedStart) {
            map.setZoom(12);
        }
    }

    const startAddress = useGeocoding(mapSectionState.selectedStart);
    const { foodbank: selectedFoodBank } = useFoodBank(mapSectionState.selectedEnd);

    return (
        <div className="flex flex-col pl-10 w-full">
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
            {/* Route Details */}
            <div className="border-2 border-gray-400 rounded-lg p-6 mb-6 shadow-sm">
                {/* Starting Point */}
                <div className="mb-5">
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
                {/* Travelling Mode */}
                <div className="pl-5 ml-[0.625rem] border-l-2 border-dashed border-gray-400 py-2">
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
                {/* Destination */}
                <div className="mt-5">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
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
            {/* Route Estimation */}
            <div className="grid grid-cols-2 gap-4 mb-6">
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
            {/* Navigation Button */}
            <Button 
                onPress={() => {handleClick()}}
                className="bg-darkgreen hover:bg-darkgreen/50 text-white font-bold py-2 px-4 rounded-lg"
            >
                {selectedType === "Food Donation Points" ? "Choose another Food Bank" : "Choose another Green Waste Bin"}
            </Button>
        </div>
    )
}