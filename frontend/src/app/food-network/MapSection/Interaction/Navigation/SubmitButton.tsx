import { Dispatch, SetStateAction } from "react";
import { Button } from "@heroui/react";
import { faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TravelMode } from "./TravelModeSelection";
import { useFoodBank } from "@/hooks/useFoodBank";

interface SubmitButtonProps {
    selectedStart: {lat: number, lng: number} | null;
    selectedEnd: string | null;
    setRouteStart: (routeStart: {lat: number, lng: number}) => void;
    setRouteEnd: (routeEnd: {lat: number, lng: number}) => void;
    setShowNavigation: (showNavigation: boolean) => void;
    setShowRouteResult: (showRouteResult: boolean) => void;
    selectedMode: TravelMode;
    setTravellingMode: Dispatch<SetStateAction<TravelMode>>;
    setError: (error: string) => void;
}

export default function SubmitButton({ selectedStart, selectedEnd, setRouteStart, setRouteEnd, setShowNavigation, setShowRouteResult, selectedMode, setTravellingMode, setError }: SubmitButtonProps) {
    const { foodbank } = useFoodBank(selectedEnd);

    const handleSubmit = () => {
        // Error message if not selected start point or food bank
        if (!selectedStart || !selectedEnd) {
            if (!selectedStart) {
                setError("*not selected start point");
            }
            if (!selectedEnd) {
                setError("*not selected food bank");
            }
            return;
        }
        setError("");

        if (foodbank) {
            console.log("Selected Food Bank:", foodbank.name);
            setRouteStart(selectedStart);
            setRouteEnd({ lat: foodbank.latitude, lng: foodbank.longitude });
            setShowNavigation(false);
            setShowRouteResult(true);
            setTravellingMode(selectedMode);
        } else {
            console.log("No matching food bank found");
        }
    };

    return (
        <Button 
            startContent={<FontAwesomeIcon icon={faRoute} />}
            onPress={handleSubmit}
            className="w-full bg-darkgreen hover:bg-darkgreen/50 text-white font-bold py-2 px-4 rounded-lg"
        >
            Get Route
        </Button>
    );
}