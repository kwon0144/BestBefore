/**
 * Geocoding Custom Hook
 * 
 * This hook provides geocoding functionality to convert latitude/longitude coordinates 
 * into a human-readable address using the Google Maps Geocoding API.
 * 
 * Features:
 * - Automatically converts coordinates to an address when provided
 * - Handles loading and error states internally
 * - Formats the address by removing the country part for cleaner display
 * - Integrates seamlessly with the Google Maps React library
 * 
 * Requirements:
 * - Must be used within a component tree that has a Google Maps Provider
 * - Requires the Geocoding library to be enabled in your Google Maps API key
 * 
 * @param {Object|null} location - The coordinates to geocode
 * @param {number} location.lat - Latitude coordinate
 * @param {number} location.lng - Longitude coordinate
 * @returns {string} The formatted address string, or empty string if coordinates are invalid
 * 
 * @example
 * // Within a component:
 * const location = { lat: 37.7749, lng: -122.4194 };
 * const address = useGeocoding(location);
 * console.log(address); // "123 Market St, San Francisco, CA"
 */
import { useState, useEffect } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

export function useGeocoding(location: { lat: number, lng: number } | null) {
    const [address, setAddress] = useState<string>("");
    const geocodingLibrary = useMapsLibrary("geocoding");
    const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

    // Initialize the Geocoder instance when the library loads
    useEffect(() => {
        if (!geocodingLibrary) return;
        setGeocoder(new geocodingLibrary.Geocoder());
    }, [geocodingLibrary]);

    // Perform geocoding when location or geocoder changes
    useEffect(() => {
        if (!geocoder || !location) {
            setAddress("");
            return;
        }

        geocoder.geocode({ location })
            .then((response) => {
                if (response.results[0]) {
                    // Format the address by removing the country part
                    setAddress(response.results[0].formatted_address.split(',').slice(0, -1).join(','));
                }
            })
            .catch((error) => {
                console.error("Error getting address:", error);
                setAddress("Address not found");
            });
    }, [location, geocoder]);

    return address;
} 