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

        // Reattach renderer to map
        directionsRenderer.setMap(map);

        // Calculate and show new route
        directionsService.route({
            origin: { lat: mapSectionState.routeStart.lat, lng: mapSectionState.routeStart.lng },
            destination: { lat: mapSectionState.routeEnd.lat, lng: mapSectionState.routeEnd.lng },
            travelMode: mapSectionState.travellingMode as google.maps.TravelMode,
            provideRouteAlternatives: true
        }, (result, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(result);
            }
        }).then((result) => {
            // Update route details in the state
            setMapSectionState({
                ...mapSectionState,
                routeDetails: {
                    duration: result.routes[0]?.legs[0]?.duration?.text || "Unknown",
                    distance: result.routes[0]?.legs[0]?.distance?.text || "Unknown"
                }
            });
        });
    }, [directionsService, directionsRenderer, map, mapSectionState, setMapSectionState]);

    return null;
}