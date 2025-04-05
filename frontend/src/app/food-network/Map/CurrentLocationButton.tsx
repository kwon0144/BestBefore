import { Button } from '@heroui/react';
import { Dispatch, SetStateAction } from 'react';

interface CurrentLocationButtonProps {
    setSelected: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
}

export default function CurrentLocationButton({ setSelected }: CurrentLocationButtonProps) {
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setSelected({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
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
            onClick={getCurrentLocation}
            color="primary"
        >
            Use Current Location
        </Button>
    );
}
