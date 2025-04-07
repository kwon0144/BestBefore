import { Dispatch, SetStateAction, useState } from "react";
import foodBanks from "@/data/foodBanks";
import { Button } from "@heroui/react";
import { faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TravelMode } from "./TravelModeSelection";
interface SubmitButtonProps {
    selectedStart: {lat: number, lng: number} | null;
    selectedEnd: string | null;
    setRouteStart: (routeStart: {lat: number, lng: number}) => void;
    setRouteEnd: (routeEnd: {lat: number, lng: number}) => void;
    setShowNavigation: (showNavigation: boolean) => void;
    setShowRouteResult: (showRouteResult: boolean) => void;
    selectedMode: TravelMode;
    setTravellingMode: Dispatch<SetStateAction<TravelMode>>;
}

export default function SubmitButton({ selectedStart, selectedEnd, setRouteStart, setRouteEnd, setShowNavigation, setShowRouteResult, selectedMode, setTravellingMode }: SubmitButtonProps) {
    const [error, setError] = useState<string>("");

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

        // Find the food bank using the key
        const selectedFoodBank = foodBanks.find(
            bank => bank.key === selectedEnd
        );

        if (selectedFoodBank) {
            console.log("Selected Food Bank:", selectedFoodBank.name);
            setRouteStart(selectedStart);
            setRouteEnd(selectedFoodBank);
            setShowNavigation(false);
            setShowRouteResult(true);
            setTravellingMode(selectedMode);
        } else {
            console.log("No matching food bank found");
        }
    };

    return (
        <>
        <Button 
            startContent={<FontAwesomeIcon icon={faRoute} />}
            onPress={handleSubmit}
            className="w-full bg-darkgreen hover:bg-darkgreen/50 text-white font-bold py-2 px-4 rounded-lg"
        >
            Get Route
        </Button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        </>
    );
}