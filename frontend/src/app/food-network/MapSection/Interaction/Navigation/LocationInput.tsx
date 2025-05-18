/**
 * LocationInput Component
 * 
 * A search input component that integrates with Google Places Autocomplete API
 * to allow users to search for and select locations on the map.
 * 
 * Features:
 * - Real-time location search with autocomplete suggestions
 * - Geocoding of selected locations
 * - Map centering and zooming to selected location
 * - Clear input functionality
 * - Results biased around Melbourne CBD
 * - Australia-only location restrictions
 */

import { Dispatch, SetStateAction, useEffect } from "react";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { useMap } from "@vis.gl/react-google-maps";
import { Input } from "@heroui/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { MapSectionState } from "../../../interfaces/State";

/**
 * Props interface for LocationInput component
 * @property {MapSectionState} mapSectionState - Current state of the map section
 * @property {Dispatch<SetStateAction<MapSectionState>>} setMapSectionState - Function to update map section state
 */
interface LocationInputProps {
    mapSectionState: MapSectionState;
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>;
}

export default function LocationInput({ mapSectionState, setMapSectionState }: LocationInputProps) {
    // Get the current map instance from the context
    const map = useMap();

    // Initialize Places Autocomplete with custom configuration
    const {
        ready,              // Whether the autocomplete service is ready
        value,             // Current input value
        suggestions: { status, data }, // Autocomplete suggestions
        setValue,          // Function to update input value
        clearSuggestions,  // Function to clear suggestions
    } = usePlacesAutocomplete({
        requestOptions: {
            // Center search results around Melbourne CBD
            location: new google.maps.LatLng(-37.8136, 144.9631),
            radius: 10000, // Search radius in meters
            componentRestrictions: { country: "au" }, // Restrict to Australian locations
        },
        debounce: 300, // Debounce time for input changes
    });

    // Initialize the input with the saved address when component mounts
    useEffect(() => {
        if (mapSectionState.currentLocationAddress) {
            setValue(mapSectionState.currentLocationAddress, false);
        }
    }, [mapSectionState.currentLocationAddress, setValue]);

    // Update input value when currentLocationAddress changes in the state
    useEffect(() => {
        // This will handle both setting the address and clearing it
        // No need for a conditional check - if it's an empty string, it will clear the input
        setValue(mapSectionState.currentLocationAddress ?? "", false);
        
        // If currentLocationAddress is empty or undefined and there's no selectedStart,
        // make sure the input is cleared
        if (!mapSectionState.currentLocationAddress && !mapSectionState.selectedStart) {
            setValue("", false);
        }
    }, [mapSectionState.currentLocationAddress, mapSectionState.selectedStart, setValue]);

    /**
     * Handles the selection of a location from the autocomplete suggestions
     * @param {string} address - The selected address
     */
    const handleSelect = async (address: string) => {
        setValue(address, false);
        clearSuggestions();
        // Convert address to coordinates
        const results = await getGeocode({ address });
        const { lat, lng } = await getLatLng(results[0]);
        // Update map state and center map on selected location
        setMapSectionState(prev => ({
            ...prev, 
            selectedStart: { lat, lng },
            // Store the address in currentLocationAddress to persist it
            currentLocationAddress: address,
            // Also update routeStart to maintain consistency
            routeStart: { lat, lng }
        }));
        map?.panTo({ lat: lat, lng: lng });
    };

    /**
     * Clears the input field and resets the map state
     */
    const onHandleClear = () => {
        setValue("", false);
        setMapSectionState(prev => ({
            ...prev, 
            selectedStart: null, 
            currentLocationAddress: "",
            // Also clear routeStart to maintain consistency
            routeStart: null 
        }));
    };

    return (
        <div className="relative w-full max-w-md">
            {/* Search input with autocomplete functionality */}
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={!ready}
                placeholder="Search"
                startContent={<FontAwesomeIcon icon={faSearch} />}
                isClearable={true}
                onClear={() => onHandleClear()}
            />
            {/* Autocomplete suggestions dropdown */}
            {status === "OK" && (
                <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <ul className="py-2 max-h-[300px] overflow-auto">
                        {data.map(({ place_id, description }) => (
                            <li
                                key={place_id}
                                onClick={() => handleSelect(description)}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                            >
                                {description}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}