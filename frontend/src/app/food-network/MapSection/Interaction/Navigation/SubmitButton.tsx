/**
 * SubmitButton.tsx
 * 
 * This component renders a button that triggers route calculation between a selected start point
 * and a food bank. It handles validation of selected points and updates the map state accordingly.
 * 
 * The button is styled with a route icon and triggers navigation when both start and end points
 * are properly selected.
 */

import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "@heroui/react";
import { faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFoodBankById } from "@/app/food-network/hooks/useFoodBanks";
import { MapSectionState } from "@/app/food-network/interfaces/State";

/**
 * Props interface for the SubmitButton component
 * @property mapSectionState - Current state of the map section including selected points
 * @property setMapSectionState - Function to update the map section state
 * @property setViewState - Function to update the view state (information, navigation, route result visibility)
 * @property setError - Function to set error messages
 */
interface SubmitButtonProps {
    mapSectionState: MapSectionState;
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>;
    setViewState: Dispatch<SetStateAction<{showInformation: boolean, showNavigation: boolean, showRouteResult: boolean}>>;
    setError: (error: string) => void;
}

/**
 * SubmitButton Component
 * 
 * A button component that handles route calculation between a selected start point and food bank.
 * It validates the selection of both points and updates the application state accordingly.
 * 
 * @param props - SubmitButtonProps containing state management functions and current state
 * @returns A styled button component with route calculation functionality
 */
export default function SubmitButton({ mapSectionState, setMapSectionState, setViewState, setError }: SubmitButtonProps) {
    // Get food bank data for the selected end point
    const { foodbank } = useFoodBankById(mapSectionState.selectedEnd);
    // Add loading state to prevent multiple submissions and flashing
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Handles the button click event
     * - Validates that both start and end points are selected
     * - Sets appropriate error messages if validation fails
     * - Updates the map state with route information if validation passes
     * - Shows the route result view
     */
    const handleSubmit = () => {
        // Prevent multiple rapid clicks
        if (isLoading) return;
        
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
        
        // Set loading state to prevent repeated submissions
        setIsLoading(true);

        if (foodbank) {
            
            // Use a short timeout to ensure DOM updates happen in a single batch
            // This helps prevent the map from flashing
            setTimeout(() => {
                // Update both states in a single render cycle
                setMapSectionState(prev => ({
                    ...prev, 
                    routeStart: mapSectionState.selectedStart, 
                    routeEnd: { 
                        lat: foodbank.latitude, 
                        lng: foodbank.longitude 
                    }
                }));
                
                setViewState(prev => ({
                    ...prev, 
                    showNavigation: false, 
                    showRouteResult: true
                }));
                
                // Reset loading state after state updates
                setIsLoading(false);
            }, 50);
        } else {
            console.log("No matching food bank found");
            setIsLoading(false);
        }
    };

    return (
        <Button 
            startContent={<FontAwesomeIcon icon={faRoute} />}
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={isLoading}
            className="w-full bg-darkgreen hover:bg-darkgreen/50 text-white font-bold py-2 px-4 rounded-lg"
        >
            Get Route
        </Button>
    );
}