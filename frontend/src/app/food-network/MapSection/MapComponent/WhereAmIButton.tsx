/**
 * WhereAmIButton Component
 * 
 * This component provides functionality to show the user's current location on the map.
 * It includes a button to toggle the location marker and uses the browser's geolocation API.
 * It also updates the location input field with the current address.
 */
"use client";

import { Button } from '@heroui/react';
import { useState, useEffect } from 'react';
import { useMap } from "@vis.gl/react-google-maps";
import { Icon } from '@iconify/react';
import { Dispatch, SetStateAction } from 'react';
import { MapSectionState } from "@/app/food-network/interfaces/State";

/**
 * Props interface for the WhereAmIButton component
 * @property {MapSectionState} mapSectionState - Current state of the map section
 * @property {Dispatch<SetStateAction<MapSectionState>>} setMapSectionState - Function to update map section state
 */
interface WhereAmIButtonProps {
    mapSectionState?: MapSectionState;
    setMapSectionState?: Dispatch<SetStateAction<MapSectionState>>;
}

/**
 * Renders a button to show/hide the user's current location on the map
 * and updates the location input with the address
 * 
 * @returns {JSX.Element} A button component with location marker functionality
 */
export default function WhereAmIButton({ mapSectionState, setMapSectionState }: WhereAmIButtonProps = {}) {
    const map = useMap();
    const [, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
    const [isMarkerVisible, setIsMarkerVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Track and update marker visibility based on external state changes
    useEffect(() => {
        // If selectedStart exists in mapSectionState, show the marker
        if (mapSectionState?.selectedStart) {
            setCurrentLocation(mapSectionState.selectedStart);
            setIsMarkerVisible(true);
        } else {
            // If selectedStart is null/undefined, hide the marker
            setIsMarkerVisible(false);
            setCurrentLocation(null);
        }
    }, [mapSectionState?.selectedStart]);

    /**
     * Handles the click event of the location button
     * Toggles the visibility of the location marker
     */
    const handleLocationButtonClick = () => {
        if (!isMarkerVisible && !isLoading) {
            getCurrentLocation();
        } else if (isMarkerVisible) {
            // Clear all location-related state
            setCurrentLocation(null);
            setIsMarkerVisible(false);
            
            // Clear the location from mapSectionState when removing the marker
            if (setMapSectionState) {
                // Force immediate state update to ensure consistency across all sections
                setMapSectionState(prev => ({
                    ...prev,
                    selectedStart: null,
                    currentLocationAddress: "",
                    // Additionally, ensure that this state is preserved during section transitions
                    routeStart: null
                }));
            }
        }
    };

    /**
     * Retrieves the user's current location using the browser's geolocation API
     * Updates the map view to center on the user's location
     * Gets the address of the location and updates mapSectionState
     */
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            setIsLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCurrentLocation(location);
                    setIsMarkerVisible(true);
                    
                    // Smooth pan and zoom to user's location
                    map?.panTo({ lat: location.lat, lng: location.lng });
                    map?.setZoom(15); // Better zoom level for viewing location details
                    
                    // Get address using reverse geocoding
                    if (setMapSectionState) {
                        try {
                            const geocoder = new google.maps.Geocoder();
                            const response = await geocoder.geocode({ location });
                            if (response.results[0]) {
                                const address = response.results[0].formatted_address;
                                
                                // Update mapSectionState with location and address
                                // Ensure these values persist across section changes
                                setMapSectionState(prev => ({
                                    ...prev,
                                    selectedStart: location,
                                    currentLocationAddress: address,
                                    // Set routeStart as well to ensure consistency
                                    routeStart: location
                                }));
                            }
                        } catch (error) {
                            console.error("Error getting address:", error);
                        }
                    }
                    setIsLoading(false);
                },
                (error) => {
                    // Provide more descriptive error messages based on error code
                    let errorMessage = "Unknown error occurred.";
                    switch(error.code) {
                        case 1:
                            errorMessage = "Permission denied. Please allow location access in your browser settings.";
                            break;
                        case 2:
                            errorMessage = "Position unavailable. The network is down or the positioning satellites can't be contacted.";
                            break;
                        case 3:
                            errorMessage = "Timeout. The request to get user location timed out.";
                            break;
                    }
                    console.error("Error getting location:", errorMessage);
                    alert(`Could not get your location: ${errorMessage}`);
                    setIsLoading(false);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };

    return (
        <div className="absolute top-0 right-16 pt-3">
            <Button
                className="w-auto p-0 bg-[#fc9003] text-white px-4 shadow-md shadow-[#fc9003]/50"
                onPress={handleLocationButtonClick}
                isLoading={isLoading}
                isDisabled={isLoading}
            >
                {isMarkerVisible ? 
                    <p>Remove</p> : 
                    <div className="flex items-center gap-2">
                        <Icon icon="lucide:map-pin" className="text-xl" />
                        <p>Where am I?</p>
                    </div>
                }
            </Button>
        </div>
    );
}