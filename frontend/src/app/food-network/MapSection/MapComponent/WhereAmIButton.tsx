import { Button } from '@heroui/react';
import { Dispatch, SetStateAction, useState } from 'react';
import { useMap, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Icon } from '@iconify/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPersonRunning } from '@fortawesome/free-solid-svg-icons';

export default function WhereAmIButton() {
    const map = useMap();
    const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
    const [isMarkerVisible, setIsMarkerVisible] = useState(false);

    const handleLocationButtonClick = () => {
        if (!isMarkerVisible) {
            getCurrentLocation();
        } else {
            setCurrentLocation(null);
            setIsMarkerVisible(false);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCurrentLocation(location);
                    setIsMarkerVisible(true);
                    map?.panTo({ lat: location.lat, lng: location.lng });
                    map?.setZoom(12);

                    // Get the address using reverse geocoding
                    try {
                        const geocoder = new google.maps.Geocoder();
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
        <>
            <div className="absolute top-0 right-16 pt-3">
                <Button
                    className="w-auto p-0 bg-[#fc9003] text-white px-4 shadow-md shadow-[#fc9003]/50"
                    onPress={handleLocationButtonClick}
                >
                    {isMarkerVisible ? 
                        <p>Remove</p> : 
                        <div className="flex items-center gap-2">
                            <Icon icon="lucide:map-pin" className="text-xl" />
                            <p>Where am I?</p>
                        </div>
                    }
                </Button>
            </div>
            {currentLocation && isMarkerVisible && (
                <AdvancedMarker position={currentLocation}>
                    <div className="text-[#fc9003] text-5xl">
                        <FontAwesomeIcon icon={faPersonRunning} />
                    </div>
                </AdvancedMarker>
            )}
        </>
    );
}