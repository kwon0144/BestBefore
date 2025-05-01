/**
 * Information Component
 * 
 * This component displays detailed information about a selected food bank, including:
 * - Name and address
 * - Operating hours for each day of the week
 * - Navigation button to get directions
 * 
 * The component uses the useFoodBank hook to fetch food bank data and formats
 * the operating hours in a user-friendly way.
 */

import { Button } from "@heroui/react";
import { SetStateAction, Dispatch } from "react";
import { useFoodBank } from "@/hooks/useFoodBank";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faMapMarkerAlt, 
    faClock,
    faDirections,
} from '@fortawesome/free-solid-svg-icons';
import { MapSectionState, ViewState } from "../../../interfaces";

// Props interface for the Information component
interface InformationProps {
    mapSectionState: MapSectionState;  // Current state of the map section
    setViewState: Dispatch<SetStateAction<ViewState>>;  // Function to update view state
}

export default function Information({ 
    mapSectionState, setViewState
}: InformationProps) {
    // Fetch food bank data using the selected endpoint
    const { foodbank, loading, error } = useFoodBank(mapSectionState.selectedEnd);
    
    // Handle click event for navigation button
    const handleClick = () => {
        setViewState((prev: ViewState) => ({...prev, showInformation: false, showNavigation: true, showRouteResult: false}));
    };

    /**
     * Formats time string into a more readable format
     * Converts 24-hour format to 12-hour format with AM/PM
     * @param hoursString - Time string in format "HH:MM-HH:MM" or similar
     * @returns Formatted time string or default message
     */
    const formatHours = (hoursString: string | null) => {
        if (!hoursString) return "Hours not specified";
        
        if (hoursString.includes('-')) {
            const [start, end] = hoursString.split('-');
            
            // Format start time
            const startParts = start.split(':');
            let startHour = parseInt(startParts[0], 10);
            const startMin = startParts.length > 1 ? startParts[1] : '00';
            const startAmPm = startHour >= 12 ? 'PM' : 'AM';
            startHour = startHour > 12 ? startHour - 12 : (startHour === 0 ? 12 : startHour);
            
            // Format end time
            const endParts = end.split(':');
            let endHour = parseInt(endParts[0], 10);
            const endMin = endParts.length > 1 ? endParts[1] : '00';
            const endAmPm = endHour >= 12 ? 'PM' : 'AM';
            endHour = endHour > 12 ? endHour - 12 : (endHour === 0 ? 12 : endHour);
            
            return `${startHour}:${startMin} ${startAmPm} - ${endHour}:${endMin} ${endAmPm}`;
        }
        
        return hoursString;
    };

    // Show nothing if no food bank is selected or data is loading
    if (!mapSectionState.selectedEnd || loading) {
        return null;
    }

    // Show error message if there's an error
    if (error) {
        return <div>Error: {error}</div>;
    }

    // Show message if no food bank data is found
    if (!foodbank) {
        return <div>No foodbank found</div>;
    }

    // Array of days with their corresponding keys for the schedule
    const daySchedule = [
        { day: 'Monday', key: 'monday' as const },
        { day: 'Tuesday', key: 'tuesday' as const },
        { day: 'Wednesday', key: 'wednesday' as const },
        { day: 'Thursday', key: 'thursday' as const },
        { day: 'Friday', key: 'friday' as const },
        { day: 'Saturday', key: 'saturday' as const },
        { day: 'Sunday', key: 'sunday' as const },
    ];

    return (
        <div className="flex flex-col gap-4 md:pl-1 lg:pl-10 w-full">
            <div className="h-full flex flex-col">
                {/* Food Bank Name and Address Section */}
                <div className="min-h-[180px] flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-darkgreen mb-6">
                        {foodbank.name}
                    </h2>
                    <div className="mb-6">
                        <div className="flex items-start">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-600 mr-3 w-5 flex-shrink-0" />
                            <p>{foodbank.address || "Address not available"}</p>
                        </div>
                    </div>
                </div>
                {/* Operating Hours Section */}
                <div className="mb-6 flex-grow overflow-y-auto">
                    <div className="flex items-center mb-3">
                        <FontAwesomeIcon icon={faClock} className="text-gray-600 mr-3 w-5 flex-shrink-0" />
                        <p className="font-semibold">Opening Hours</p>
                    </div>
                    <div className="rounded-lg px-3 py-2">
                        {foodbank.operation_schedule.is_24_hours ? (
                            <p className="text-green-600">Open 24 hours, every day</p>
                        ) : Object.values(foodbank.operation_schedule.daily_schedule).every(day => !day.hours) ? (
                            <p className="text-gray-600">Opening hours not specified</p>
                        ) : (
                            <div className="grid gap-1">
                                {daySchedule.map((item) => {
                                    const daySchedule = foodbank.operation_schedule.daily_schedule[item.key];
                                    const isOpen = daySchedule?.is_open || false;
                                    const hours = daySchedule?.hours || null;
                                    
                                    return (
                                        <div key={item.day} className="flex flex-row justify-between items-center py-0.5 pr-3">
                                            <p className="text-sm ">{item.day}</p>
                                            <p className={`text-sm ${isOpen ? "text-green-600" : "text-gray-400"}`}>
                                                {isOpen ? formatHours(hours) : "Closed"}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
                {/* Navigation Button Section */}
                <div className="mt-auto flex flex-row gap-4 pr-5">
                    <Button
                        onPress={handleClick}
                        className="flex-1 bg-darkgreen text-white py-2 px-4 rounded-lg"
                    >
                        <FontAwesomeIcon icon={faDirections} className="mr-2" />
                        Get Directions
                    </Button>
                </div>
            </div>
        </div>
    );
}