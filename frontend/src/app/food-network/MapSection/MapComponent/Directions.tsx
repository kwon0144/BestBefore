import { useMap } from "@vis.gl/react-google-maps";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import { MapSectionState } from "@/app/food-network/page";

interface DirectionsProps {
    mapSectionState: MapSectionState
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>
}

export default function Directions({ mapSectionState, setMapSectionState }: DirectionsProps) {
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes")
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

    // Initialize directions service and renderer
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

        return () => {
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setMap(null);
            }
        };
    }, [routesLibrary, map]);

    // Handle route changes
    useEffect(() => {
        if (!directionsService || !directionsRenderer || !map) return;

        if (!mapSectionState.routeStart || !mapSectionState.routeEnd) {
            // Remove route from map
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
            setMapSectionState({
                ...mapSectionState,
                routeDetails: {
                    duration: result.routes[0]?.legs[0]?.duration?.text || "Unknown",
                    distance: result.routes[0]?.legs[0]?.distance?.text || "Unknown"
                }
            });
        });
    }, [directionsService, directionsRenderer, map]);

    return null;
}