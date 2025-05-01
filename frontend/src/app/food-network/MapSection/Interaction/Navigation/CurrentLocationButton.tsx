/**
 * CurrentLocationButton Component
 * 
 * A button component that allows users to get their current location and update the map accordingly.
 * When pressed, it:
 * 1. Gets the user's current geolocation
 * 2. Updates the map's center to the user's location
 * 3. Performs reverse geocoding to get the address
 * 4. Updates the map state with the location and address
 */

import { Button } from '@heroui/react';
import { Dispatch, SetStateAction } from 'react';
import { useMap } from "@vis.gl/react-google-maps";
import { Icon } from '@iconify/react';
import { MapSectionState } from '../../../interfaces';

// Props interface for the CurrentLocationButton component
interface CurrentLocationButtonProps {
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>;
}

export default function CurrentLocationButton({setMapSectionState }: CurrentLocationButtonProps) {
    const map = useMap();

    /**
     * Handles getting the user's current location
     * Uses the browser's geolocation API to:
     * - Get current coordinates
     * - Update map center and zoom
     * - Perform reverse geocoding to get address
     */
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    // Create location object from coordinates
                    const location = {
                        lat: Number(position.coords.latitude),
                        lng: Number(position.coords.longitude)
                    };
                    
                    // Update map state with new location
                    setMapSectionState(prev => ({...prev, selectedStart: location}));
                    
                    // Center map on user's location and set zoom level
                    map?.panTo({ lat: location.lat, lng: location.lng });
                    map?.setZoom(12);

                    // Get address using Google Maps Geocoding API
                    try {
                        const geocoder = new google.maps.Geocoder();
                        const response = await geocoder.geocode({ location });
                        if (response.results[0]) {
                            setMapSectionState(prev => ({...prev, currentLocationAddress:response.results[0].formatted_address }));
                        }
                    } catch (error) {
                        console.error("Error getting address:", error);
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };

    // Render a button with a map pin icon
    return (
        <Button
            className="w-auto p-0"
            onPress={getCurrentLocation}
            color="primary"
        >
            <Icon icon="lucide:map-pin" className="text-xl" />
        </Button>
    );
}
