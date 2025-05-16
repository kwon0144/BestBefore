/**
 * Markers Component
 * 
 * This component manages the display of location markers on the map.
 * It handles marker clustering and provides interactive functionality for selecting locations.
 */
"use client";

import { useMap, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { Marker } from "@googlemaps/markerclusterer";
import { useEffect, useState, useRef, SetStateAction, Dispatch } from "react";
import { MapSectionState } from "@/app/food-network/interfaces/State";

/**
 * Point interface for map markers
 * @interface
 */
type Point = google.maps.LatLngLiteral & { key: string};

/**
 * Props interface for the Markers component
 * @interface
 */
interface Props { 
    /** Array of points to display as markers */
    points: Point[]
    /** Function to update map section state */
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>
    /** Current state of the map section */
    mapSectionState: MapSectionState
}

/**
 * Renders and manages markers on the map with clustering functionality
 * 
 * @param {Props} props - Component properties
 * @returns {JSX.Element} A collection of markers with clustering support
 */
export default function Markers({ points, setMapSectionState, mapSectionState }: Props) {
    const map = useMap();
    const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
    const clusterer = useRef<MarkerClusterer | null>(null);

    // Initialize marker clusterer when map is available
    useEffect(() => {
        if (!map) return;
        if (!clusterer.current) {
            clusterer.current = new MarkerClusterer({ map });
        }
    }, [map]);

    // Update clusterer when markers change
    useEffect(() => {
        clusterer.current?.clearMarkers();
        clusterer.current?.addMarkers(Object.values(markers));
    }, [markers]);

    /**
     * Sets the reference for a marker and manages the markers state
     * 
     * @param {Marker | null} marker - The marker reference
     * @param {string} key - The unique key for the marker
     */
    const setMarkerRef = (marker: Marker | null, key: string) => {
        if (marker && markers[key]) return;
        if (!marker && !markers[key]) return;

        setMarkers((prev) => {
            if (marker) {
                return { ...prev, [key]: marker };
            } else {
                const newMarkers = { ...prev };
                delete newMarkers[key];
                return newMarkers;
            }
        });
    };

    /**
     * Handles marker click events
     * Updates the selected end point in the map section state
     * Centers and zooms the map on the clicked marker
     * 
     * @param {Point} point - The clicked point
     */
    const handleMarkerClick = (point: Point) => {
        // Update the selected end point
        setMapSectionState({
            ...mapSectionState,
            selectedEnd: point.key,
        });
        
        // Center and zoom the map on the clicked marker
        if (map) {
            // Smooth pan to the marker position
            map.panTo({ lat: point.lat, lng: point.lng });
            // Zoom in to a closer level
            map.setZoom(16);
        }
    };

    return (
        <>
            {points.map((point) => (
                <AdvancedMarker
                    position={point}
                    key={point.key}
                    onClick={() => handleMarkerClick(point)}
                    clickable={true}
                    ref={(marker) => {
                        setMarkerRef(marker, point.key);
                    }}
                >
                    {mapSectionState.selectedEnd === point.key ?
                        <Pin
                            glyph="D"
                            background="#fc9003" 
                            borderColor="#964B00"
                            glyphColor="white"
                            scale={1.5}
                        />:
                        <Pin
                            background="green" 
                            borderColor="white"
                            glyphColor="white"
                        />
                    }
                </AdvancedMarker>
            ))}
        </>
    );
} 