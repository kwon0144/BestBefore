import { useState, useEffect } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

export function useGeocoding(location: { lat: number, lng: number } | null) {
    const [address, setAddress] = useState<string>("");
    const geocodingLibrary = useMapsLibrary("geocoding");
    const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

    useEffect(() => {
        if (!geocodingLibrary) return;
        setGeocoder(new geocodingLibrary.Geocoder());
    }, [geocodingLibrary]);

    useEffect(() => {
        if (!geocoder || !location) {
            setAddress("");
            return;
        }

        geocoder.geocode({ location })
            .then((response) => {
                if (response.results[0]) {
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