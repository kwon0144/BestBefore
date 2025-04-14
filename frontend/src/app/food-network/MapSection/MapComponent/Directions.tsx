import { useMap } from "@vis.gl/react-google-maps";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";

interface DirectionsProps {
    routeStart: { lat: number, lng: number } | null
    routeEnd: { lat: number, lng: number } | null
    setRouteDetails: Dispatch<SetStateAction<{ duration: string, distance: string }>>
    travellingMode: string
}

export default function Directions({ routeStart, routeEnd, setRouteDetails, travellingMode }: DirectionsProps) {
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

        if (!routeStart || !routeEnd) {
            // Remove route from map
            directionsRenderer.setMap(null);
            return;
        }

        // Reattach renderer to map
        directionsRenderer.setMap(map);

        // Calculate and show new route
        directionsService.route({
            origin: { lat: routeStart.lat, lng: routeStart.lng },
            destination: { lat: routeEnd.lat, lng: routeEnd.lng },
            travelMode: travellingMode as google.maps.TravelMode,
            provideRouteAlternatives: true
        }, (result, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(result);
            }
        }).then((result) => {
            setRouteDetails(
                {
                    duration: result.routes[0]?.legs[0]?.duration?.text || "Unknown",
                    distance: result.routes[0]?.legs[0]?.distance?.text || "Unknown"
                }
            );
        });
    }, [directionsService, directionsRenderer, routeStart, routeEnd, travellingMode, map]);

    return null;
}