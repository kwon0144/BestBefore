import { Button } from '@heroui/react';
import { Dispatch, SetStateAction } from 'react';
import { useMap } from "@vis.gl/react-google-maps";
import { Icon } from '@iconify/react';
import { MapSectionState } from '../../../interfaces';
interface CurrentLocationButtonProps {
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>;
}

export default function CurrentLocationButton({setMapSectionState }: CurrentLocationButtonProps) {
    const map = useMap();

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const location = {
                        lat: Number(position.coords.latitude),
                        lng: Number(position.coords.longitude)
                    };
                    setMapSectionState(prev => ({...prev, selectedStart: location}));
                    map?.panTo({ lat: location.lat, lng: location.lng });
                    map?.setZoom(12);

                    // Get the address using reverse geocoding
                    try {
                        const geocoder = new google.maps.Geocoder();
                        const response = await geocoder.geocode({ location });
                        if (response.results[0]) {
                            setMapSectionState(prev => ({...prev, currentLocationAddress:response.results[0].formatted_address }));
                        }
                    } catch (error) {
                        console.error("Error getting address:", error);
                    }
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
            className="w-auto p-0"
            onPress={getCurrentLocation}
            color="primary"
        >
            <Icon icon="lucide:map-pin" className="text-xl" />
        </Button>
    );
}
