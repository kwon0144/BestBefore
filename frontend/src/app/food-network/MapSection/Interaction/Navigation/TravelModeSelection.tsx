import { Radio } from "@heroui/react";
import { RadioGroup } from "@heroui/react";
import { Dispatch, SetStateAction } from "react";

interface TravelModeSelectionProps {
    setSelectedMode: Dispatch<SetStateAction<string>>;
}

export default function TravelModeSelection({ setSelectedMode }: TravelModeSelectionProps) {
    const travellingModes = ["WALKING", "TRANSIT", "BICYCLING", "DRIVING"];

    return (
        <>
            <p className="font-semibold">Travelling Mode: </p>
            <RadioGroup
                defaultValue={travellingModes[0]}
                onValueChange={(value) => {
                    setSelectedMode(value);
                }}
                isRequired={true}
                color="primary"
                >
                <div className="flex flex-row">
                    <div className="flex flex-col gap-5">
                        {travellingModes.slice(0, 2).map((mode) => (
                            <Radio key={mode} className="capitalize pr-9 text-gray-500" color="primary" value={mode}>
                                {mode}
                            </Radio>
                        ))}
                    </div>
                    <div className="flex flex-col gap-5">
                        {travellingModes.slice(2, 4).map((mode) => (
                            <Radio key={mode} className="capitalize pr-9 text-gray-500" color="primary" value={mode}>
                                {mode}
                            </Radio>
                        ))}
                    </div>
                </div>
            </RadioGroup>
        </>
    );
}