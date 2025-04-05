import { Button } from '@heroui/react';
import { Dispatch, SetStateAction } from 'react';
import { useMap } from "@vis.gl/react-google-maps";

interface CurrentLocationButtonProps {
    setSelectedStart: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
}

export default function CurrentLocationButton({ setSelectedStart }: CurrentLocationButtonProps) {
    const map = useMap();

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setSelectedStart({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    map?.panTo({ lat: position.coords.latitude, lng: position.coords.longitude });
                    map?.setZoom(12);
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };

    return (
        <Button
            onPress={getCurrentLocation}
            color="primary"
        >
            Use Current Location
        </Button>
    );
}
