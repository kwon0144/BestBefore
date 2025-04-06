import { useFoodBankName } from "@/hooks/useFoodBank";
import { useGeocoding } from "@/hooks/useGeocoding";
import { Button } from "@heroui/react";
import { Dispatch, SetStateAction } from "react";
import { useMap } from "@vis.gl/react-google-maps";

interface RouteResultProps {
    selectedEnd: string | null;
    selectedStart: {lat: number, lng: number} | null;
    setSelectedStart: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    showRouteResult: boolean;
    setShowRouteResult: Dispatch<SetStateAction<boolean>>;
    setShowInformation: Dispatch<SetStateAction<boolean>>;
    routeDetails: {
        duration: string;
        distance: string;
    };
    setRouteStart: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    setRouteEnd: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
}

export default function RouteResult({ 
    selectedEnd, 
    selectedStart, 
    showRouteResult, 
    setShowRouteResult, 
    setShowInformation, 
    routeDetails, 
    setSelectedStart,
    setRouteStart,
    setRouteEnd
}: RouteResultProps) {

    const map = useMap();

    const handleClick = () => {
        setShowRouteResult(false);
        setShowInformation(true);
        setRouteStart(null);
        setRouteEnd(null);
        if (map) {
            map.setZoom(15);
            map.setCenter({lat: -37.8136, lng: 144.9631});
        }
    }

    const startAddress = useGeocoding(selectedStart);
    const selectedFoodBank = useFoodBankName(selectedEnd);

    return (
        <div className={`flex flex-col gap-4 pl-10 w-full ${showRouteResult ? "display" : "hidden"}`}>
            {routeDetails?
                <div>
                    <p>Route Summary:</p>
                    <p>From: {selectedStart ? startAddress : ""}</p>
                    <p>To: {selectedFoodBank}</p>
                    <p>Estimated Time: {routeDetails.duration}</p>
                    <p>Estimated Distance: {routeDetails.distance}</p>
                </div>
            :
            <div>
                <p>No routes found</p>
                </div>
            }
            <Button 
                onPress={() => {handleClick()}}
                className="bg-darkgreen hover:bg-darkgreen/50 text-white font-bold py-2 px-4 rounded-lg"
            >
                Choose another FoodBank
            </Button>
        </div>
    )
}