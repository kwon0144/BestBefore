import { Button } from "@heroui/react";
import { useState, useEffect, SetStateAction, Dispatch } from "react";
import { useFoodBank } from "@/hooks/useFoodBank";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faMapMarkerAlt, 
    faClock,
    faDirections,
    faBook
} from '@fortawesome/free-solid-svg-icons';

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
    const { foodbank, loading, error } = useFoodBank(
        selectedEnd ? { 
            lat: parseFloat(selectedEnd.split(',')[0]), 
            lng: parseFloat(selectedEnd.split(',')[1]) 
        } : null
    );
    
    const handleClick = () => {
        setShowInformation(false);
        setShowNavigation(true);
    };

    const formatDays = (days: string[]) => {
        if (days.length === 7) return 'Daily';
        if (days.length === 0) return 'Closed';
        
        const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const weekend = ['saturday', 'sunday'];
        
        if (days.length === 5 && weekdays.every(day => days.map(d => d.toLowerCase()).includes(day))) {
            return 'Weekdays';
        }
        
        if (days.length === 2 && weekend.every(day => days.map(d => d.toLowerCase()).includes(day))) {
            return 'Weekends';
        }
        
        return days.map(day => day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()).join(', ');
    };

    const formatHours = (hoursString: string | null) => {
        if (!hoursString) return "Hours not specified";
        
        if (hoursString.includes('-')) {
            const [start, end] = hoursString.split('-');
            
            const startParts = start.split(':');
            let startHour = parseInt(startParts[0], 10);
            const startMin = startParts.length > 1 ? startParts[1] : '00';
            const startAmPm = startHour >= 12 ? 'PM' : 'AM';
            startHour = startHour > 12 ? startHour - 12 : (startHour === 0 ? 12 : startHour);
            
            const endParts = end.split(':');
            let endHour = parseInt(endParts[0], 10);
            const endMin = endParts.length > 1 ? endParts[1] : '00';
            const endAmPm = endHour >= 12 ? 'PM' : 'AM';
            endHour = endHour > 12 ? endHour - 12 : (endHour === 0 ? 12 : endHour);
            
            return `${startHour}:${startMin} ${startAmPm} - ${endHour}:${endMin} ${endAmPm}`;
        }
        
        return hoursString;
    };

    if (!selectedEnd || loading) {
        return null;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!foodbank) {
        return <div>No foodbank found</div>;
    }

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
        <div className={`flex flex-col gap-4 pl-10 w-full ${showInformation ? "display" : "hidden"}`}>
            <div className="h-full flex flex-col">
                <h2 className="text-2xl font-bold text-darkgreen mb-6">
                    {foodbank.name}
                </h2>
                <div className="mb-6">
                    <div className="flex items-start mb-3">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-600 mr-3 w-5 flex-shrink-0" />
                        <p>{foodbank.address || "Address not available"}</p>
                    </div>
                </div>
                <div className="mb-6">
                    <div className="flex items-center mb-3">
                        <FontAwesomeIcon icon={faClock} className="text-gray-600 mr-3 w-5 flex-shrink-0" />
                        <p className="font-semibold">Opening Hours</p>
                    </div>
                    <div className="rounded-lg px-5 py-2 pr-10">
                        {foodbank.operation_schedule.is_24_hours ? (
                            <p className="text-green-600 font-medium">Open 24 hours, every day</p>
                        ) : (
                            daySchedule.map((item) => {
                                const daySchedule = foodbank.operation_schedule.daily_schedule[item.key];
                                const isOpen = daySchedule?.is_open || false;
                                const hours = daySchedule?.hours || null;
                                
                                return (
                                    <div key={item.day} className="flex justify-between py-1">
                                        <p>{item.day}</p>
                                        <p className={isOpen ? "text-green-600" : "text-gray-400"}>
                                            {isOpen ? formatHours(hours) : "Closed"}
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                {/* Buttons */}
                <div className="mt-auto flex flex-row gap-4">
                    <Button
                        onPress={handleClick}
                        className="flex-1 bg-darkgreen text-white font-bold py-2 px-4 rounded-lg"
                    >
                        <FontAwesomeIcon icon={faDirections} className="mr-2" />
                        Get Directions
                    </Button>
                    <Button 
                        className="flex-1 bg-darkgreen text-white py-2 px-4 rounded-lg">
                        <FontAwesomeIcon icon={faBook} className="mr-2" />
                        Get Donation Guide
                    </Button>
                </div>
            </div>
        </div>
    );
}