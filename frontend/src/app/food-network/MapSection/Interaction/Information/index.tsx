import { Button } from "@heroui/react";
import { useState, useEffect, SetStateAction, Dispatch } from "react";
import { useFoodBankName } from "@/hooks/useFoodBank";

interface InformationProps {
    selectedEnd: string | null;
    setShowInformation: Dispatch<SetStateAction<boolean>>;
    setShowNavigation: Dispatch<SetStateAction<boolean>>;
    showInformation: boolean;
}

export default function Information({ 
    selectedEnd,
    setShowInformation,
    setShowNavigation,
    showInformation
}: InformationProps) {
    
    const selectedFoodBank = useFoodBankName(selectedEnd);
    
    const handleClick = () => {
        setShowInformation(false);
        setShowNavigation(true);
    };

    return (
        <div className={`flex flex-col gap-4 pl-10 w-full ${showInformation ? "display" : "hidden"}`}>
            <p className="font-semibold">Target Food Bank</p>
            {selectedEnd?
                <div>
                    <p>{selectedFoodBank}</p>
                    <Button onPress={() => handleClick()} className="bg-darkgreen hover:bg-darkgreen/50 text-white font-bold py-2 px-4 rounded-lg">How to get there</Button>
                </div>
                :
                <div>
                    <p>Select a Food Bank on Map</p>
                </div>
            }
            
        </div>
    );
}