/**
 * WhereAmIButton Component
 * 
 * This component provides functionality to show the user's current location on the map.
 * It includes a button to toggle the location marker and uses the browser's geolocation API.
 */
"use client";

import { Button } from '@heroui/react';
import { useState } from 'react';
import { useMap, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Icon } from '@iconify/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';

/**
 * Renders a button to show/hide the user's current location on the map
 * 
 * @returns {JSX.Element} A button component with location marker functionality
 */
export default function WhereAmIButton() {
    const map = useMap();
    const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
    const [isMarkerVisible, setIsMarkerVisible] = useState(false);

    /**
     * Handles the click event of the location button
     * Toggles the visibility of the location marker
     */
    const handleLocationButtonClick = () => {
        if (!isMarkerVisible) {
            getCurrentLocation();
        } else {
            setCurrentLocation(null);
            setIsMarkerVisible(false);
        }
    };

    /**
     * Retrieves the user's current location using the browser's geolocation API
     * Updates the map view to center on the user's location
     */
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCurrentLocation(location);
                    setIsMarkerVisible(true);
                    map?.panTo({ lat: location.lat, lng: location.lng });
                    map?.setZoom(12);
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };

    return (
        <>
            <div className="absolute top-0 right-16 pt-3">
                <Button
                    className="w-auto p-0 bg-[#fc9003] text-white px-4 shadow-md shadow-[#fc9003]/50"
                    onPress={handleLocationButtonClick}
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
            {currentLocation && isMarkerVisible && (
                <AdvancedMarker position={currentLocation}>
                    <div className="text-[#964B00] text-4xl">
                        <FontAwesomeIcon icon={faLocationCrosshairs} />
                    </div>
                </AdvancedMarker>
            )}
        </>
    );
}