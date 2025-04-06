import { useMap } from "@vis.gl/react-google-maps";

import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

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

    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new routesLibrary.DirectionsService());
        setDirectionsRenderer(new routesLibrary.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: '#148526', // Green color
                strokeWeight: 10
            }
        }));
    }, [routesLibrary, map]);

    useEffect(() => {
        if (!directionsService || !directionsRenderer || !routeStart || !routeEnd) return;

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
    }, [directionsService, directionsRenderer, routeStart, routeEnd, travellingMode]);

    useEffect(() => {
        if (!directionsRenderer) return;
        directionsRenderer.setRouteIndex(0);
    }, [directionsRenderer]);

    return null;
}