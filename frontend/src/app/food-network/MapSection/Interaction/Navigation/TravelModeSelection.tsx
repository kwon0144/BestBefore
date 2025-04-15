import { Dispatch, SetStateAction } from "react";
import { faWalking, faBus, faBicycle, faCar, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@heroui/react";
import { MapSectionState, TravelMode } from "../../../interfaces";

interface TravelModeSelectionProps {
    mapSectionState: MapSectionState;
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>;
}

export default function TravelModeSelection({ mapSectionState, setMapSectionState }: TravelModeSelectionProps) {
    const modeIcons: Record<TravelMode, IconDefinition> = {
        WALKING: faWalking,
        TRANSIT: faBus,
        BICYCLING: faBicycle,
        DRIVING: faCar
    };

    const travelModes: TravelMode[] = ["WALKING", "TRANSIT", "BICYCLING", "DRIVING"];

    return (
        <>
            <p className="text-lg font-semibold mb-3 text-green-700">
                Transportation Mode
            </p>
            <div className="grid grid-cols-4 gap-3">
                {travelModes.map((mode: TravelMode) => (
                    <Button
                        key={mode}
                        className={`flex flex-col h-full items-center justify-center p-4 rounded-lg border-2 
                            ${mapSectionState.travellingMode === mode ? "bg-lightgreen border-lightgreen shadow-[0_0_0_2px_rgba(34,197,94,0.2)]" : "border-gray-300"} 
                            cursor-pointer whitespace-nowrap`}
                        onPress={() => setMapSectionState(prev => ({...prev, travellingMode: mode}))}
                    >
                        <FontAwesomeIcon icon={modeIcons[mode]} className={`text-2xl mb-2 ${mapSectionState.travellingMode === mode ? "text-green-700" : "text-gray-600"}`} />
                        <span>
                            {mode.charAt(0) + mode.slice(1).toLowerCase()}
                        </span>
                    </Button>
                ))}
            </div>
        </>
    );
}