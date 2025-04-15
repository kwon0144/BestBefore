import { Dispatch, SetStateAction } from "react";
import { Button } from "@heroui/react";
import { faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFoodBank } from "@/hooks/useFoodBank";
import { MapSectionState } from "@/app/food-network/interfaces";

interface SubmitButtonProps {
    mapSectionState: MapSectionState;
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>;
    setViewState: Dispatch<SetStateAction<{showInformation: boolean, showNavigation: boolean, showRouteResult: boolean}>>;
    setError: (error: string) => void;
}

export default function SubmitButton({ mapSectionState, setMapSectionState, setViewState, setError }: SubmitButtonProps) {
    const { foodbank } = useFoodBank(mapSectionState.selectedEnd);

    const handleSubmit = () => {
        // Error message if not selected start point or food bank
        if (!mapSectionState.selectedStart || !mapSectionState.selectedEnd) {
            if (!mapSectionState.selectedStart) {
                setError("*not selected start point");
            }
            if (!mapSectionState.selectedEnd) {
                setError("*not selected food bank");
            }
            return;
        }
        setError("");

        if (foodbank) {
            console.log("Selected Food Bank:", foodbank.name);
            setMapSectionState(prev => ({...prev, routeStart: mapSectionState.selectedStart, routeEnd: { lat: foodbank.latitude, lng: foodbank.longitude }}));
            setViewState(prev => ({...prev, showNavigation: false, showRouteResult: true}));
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