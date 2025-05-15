/**
 * Directions Component
 * 
 * This component handles the rendering of route directions between two points on the map.
 * It uses Google Maps Directions Service to calculate routes and displays them on the map.
 */
"use client";

import { useMap } from "@vis.gl/react-google-maps";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import { MapSectionState } from "@/app/food-network/interfaces";

/**
 * Props interface for the Directions component
 * @interface
 */
interface DirectionsProps {
    /** Current state of the map section */
    mapSectionState: MapSectionState
    /** Function to update map section state */
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>
}

/**
 * Renders and manages route directions between two points on the map
 * 
 * @param {DirectionsProps} props - Component properties
 * @returns {null} This component doesn't render any visible elements
 */
export default function Directions({ mapSectionState, setMapSectionState }: DirectionsProps) {
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes")
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

    // Initialize directions service and renderer when map and routes library are available
    useEffect(() => {
        if (!routesLibrary || !map) return;
        
        setDirectionsService(new routesLibrary.DirectionsService());
        const renderer = new routesLibrary.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: "#964B00",
                strokeWeight: 10
            }
        });
        setDirectionsRenderer(renderer);
        directionsRendererRef.current = renderer;

        // Cleanup function to remove renderer from map when component unmounts
        return () => {
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setMap(null);
            }
        };
    }, [routesLibrary, map]);

    // Handle route changes when start/end points or travel mode changes
    useEffect(() => {
        if (!directionsService || !directionsRenderer || !map) return;

        if (!mapSectionState.routeStart || !mapSectionState.routeEnd) {
            // Remove route from map if start or end points are not set
            directionsRenderer.setMap(null);
            return;
        }

        // Use a debounce mechanism to avoid frequent re-renders
        const updateRoute = async () => {
            try {
                // We already checked that these values are not null above, but add additional check
                // to satisfy TypeScript
                if (!mapSectionState.routeStart || !mapSectionState.routeEnd) return;
                
                // Reattach renderer to map
                directionsRenderer.setMap(map);
                
                // Calculate and show new route
                const result = await directionsService.route({
                    origin: { lat: mapSectionState.routeStart.lat, lng: mapSectionState.routeStart.lng },
                    destination: { lat: mapSectionState.routeEnd.lat, lng: mapSectionState.routeEnd.lng },
                    travelMode: mapSectionState.travellingMode as google.maps.TravelMode,
                    provideRouteAlternatives: true
                });
                
                if (result && directionsRenderer) {
                    // Set directions only if the renderer is still available
                    directionsRenderer.setDirections(result);
                    
                    // Update route details in the state only if there's a change
                    const newDuration = result.routes[0]?.legs[0]?.duration?.text || "Unknown";
                    const newDistance = result.routes[0]?.legs[0]?.distance?.text || "Unknown";
                    
                    if (newDuration !== mapSectionState.routeDetails.duration || 
                        newDistance !== mapSectionState.routeDetails.distance) {
                        setMapSectionState(prev => ({
                            ...prev,
                            routeDetails: {
                                duration: newDuration,
                                distance: newDistance
                            }
                        }));
                    }
                }
            } catch (error) {
                console.error("Error calculating route:", error);
                // Don't update the UI if there's an error to prevent flashing
            }
        };
        
        // Use setTimeout to avoid multiple rapid calculations
        const timeoutId = setTimeout(updateRoute, 100);
        
        return () => {
            clearTimeout(timeoutId);
        };
    }, [
        directionsService, 
        directionsRenderer, 
        map, 
        mapSectionState.routeStart, 
        mapSectionState.routeEnd, 
        mapSectionState.travellingMode,
        mapSectionState.routeDetails.distance,
        mapSectionState.routeDetails.duration,
        setMapSectionState
    ]);

    return null;
}