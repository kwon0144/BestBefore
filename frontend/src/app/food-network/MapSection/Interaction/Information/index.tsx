import { Button } from "@heroui/react";
import { useState, useEffect, SetStateAction, Dispatch } from "react";
import { useFoodBankName } from "@/hooks/useFoodBank";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faMapMarkerAlt, 
    faPhone, 
    faEnvelope, 
    faGlobe, 
    faClock,
    faDirections ,
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
    
    const selectedFoodBank = useFoodBankName(selectedEnd);
    
    const handleClick = () => {
        setShowInformation(false);
        setShowNavigation(true);
    };

    return (
        <div className={`flex flex-col gap-4 pl-10 w-full ${showInformation ? "display" : "hidden"}`}>
                <div className="h-full flex flex-col">
                    <h2 className="text-2xl font-bold text-darkgreen mb-6">
                    {selectedFoodBank}
                    </h2>
                    <div className="mb-6">
                        <div className="flex items-start mb-3">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-600 mr-3 w-5 flex-shrink-0" />
                            <p>123 Main Street, Melbourne, VIC 3000</p>
                        </div>

                        <div className="flex items-center mb-3">
                            <FontAwesomeIcon icon={faPhone} className="text-gray-600 mr-3 w-5 flex-shrink-0" />
                            <p>03 9999 9999</p>
                        </div>

                        <div className="flex items-center mb-3">
                            <FontAwesomeIcon icon={faEnvelope} className="text-gray-600 mr-3 w-5 flex-shrink-0" />
                            <p>info@foodbank.com.au</p>
                        </div>

                        <div className="flex items-center">
                            <FontAwesomeIcon icon={faGlobe} className="text-gray-600 mr-3 w-5 flex-shrink-0" />
                            <a
                            href={`https://www.foodbank.com.au`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            >
                            www.foodbank.com.au
                            </a>
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="flex items-center">
                        <FontAwesomeIcon icon={faClock} className="text-gray-600 mr-3 w-5 flex-shrink-0" />
                            <p className="font-semibold">Opening Hours</p>
                        </div>
                        <div className="rounded-lg px-5 py-2 pr-10">
                            <div
                                className="flex justify-between py-1"
                            >
                                <p>Monday</p>
                                <p>9:00 AM - 5:00 PM</p>
                            </div>
                            <div
                                className="flex justify-between py-1"
                            >
                                <p>Monday</p>
                                <p>9:00 AM - 5:00 PM</p>
                            </div>
                            <div
                                className="flex justify-between py-1"
                            >
                                <p>Monday</p>
                                <p>9:00 AM - 5:00 PM</p>
                            </div>
                            <div
                                className="flex justify-between py-1"
                            >
                                <p>Monday</p>
                                <p>9:00 AM - 5:00 PM</p>
                            </div>
                            <div
                                className="flex justify-between py-1"
                            >
                                <p>Monday</p>
                                <p>9:00 AM - 5:00 PM</p>
                            </div>
                            <div
                                className="flex justify-between py-1"
                            >
                                <p>Monday</p>
                                <p>9:00 AM - 5:00 PM</p>
                            </div>
                            <div
                                className="flex justify-between py-1"
                            >
                                <p>Monday</p>
                                <p>9:00 AM - 5:00 PM</p>
                            </div>

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