import { useMap } from "@vis.gl/react-google-maps";

import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

interface DirectionsProps {
    routeStart: {lat: number, lng: number} | null
    routeEnd: {lat: number, lng: number} | null
}

export default function Directions({ routeStart, routeEnd }: DirectionsProps) {
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes")
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
    const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
    const [routeIndex, setRouteIndex] = useState<number>(0);
    const selectedRoute = routes[routeIndex];
    const leg = selectedRoute?.legs[0];

    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new routesLibrary.DirectionsService());
        setDirectionsRenderer(new routesLibrary.DirectionsRenderer({
            map,
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
            travelMode: google.maps.TravelMode.WALKING,
            provideRouteAlternatives: true
        }, (result, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(result);
            }
        }).then((result) => {
            setRoutes(result.routes);
        });
    }, [directionsService, directionsRenderer, routeStart, routeEnd]);

    useEffect(() => {
        if (!directionsRenderer) return;
        directionsRenderer.setRouteIndex(routeIndex);
    }, [routeIndex, directionsRenderer]);

    if (!leg) return null;

    return (
        <div className="absolute w-[300px] top-0 right-0 px-5 pt-0 m-1 text-white bg-gray-800 rounded">
            <h1>{selectedRoute.summary}</h1>
            <p>{leg.start_address.split(',')[0]} to {leg.end_address.split(',')[0]}</p>
            <p>Estimated Time: {leg.duration?.text}</p>
            <p>Estimated Distance: {leg.distance?.text}</p>
            <h1>Other Routes</h1>
            <ul>
                {routes.map((route, index) => (
                    <li key={index}><button onClick={() => setRouteIndex(index)}>{route.summary}</button></li>
                ))}
            </ul>
        </div>
    )
}