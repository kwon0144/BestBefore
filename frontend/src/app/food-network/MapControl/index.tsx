import LocationInput from "./LocationInput";
import CurrentLocationButton from "./CurrentLocationButton";
import SubmitButton from "./SubmitButton";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface MapControlProps {
    setSelectedStart: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    setSelectedEnd: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    setRouteStart: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    setRouteEnd: Dispatch<SetStateAction<{lat: number, lng: number} | null>>;
    selectedStart: {lat: number, lng: number} | null;
    selectedEnd: {lat: number, lng: number} | null;
}

export default function MapControl({ 
    setSelectedStart, 
    setSelectedEnd, 
    setRouteStart, 
    setRouteEnd,
    selectedStart,
    selectedEnd 
}: MapControlProps) {
    const [startAddress, setStartAddress] = useState<string>("");
    const [endAddress, setEndAddress] = useState<string>("");

    const geocodingLibrary = useMapsLibrary("geocoding");
    const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

    useEffect(() => {
        if (!geocodingLibrary) return;
        setGeocoder(new geocodingLibrary.Geocoder());
    }, [geocodingLibrary]);

    useEffect(() => {
        if (!geocoder || !selectedStart) {
            setStartAddress("");
            return;
        }

        geocoder.geocode({ location: selectedStart })
            .then((response) => {
                if (response.results[0]) {
                    setStartAddress(response.results[0].formatted_address);
                }
            })
            .catch((error) => {
                console.error("Error getting start address:", error);
                setStartAddress("Address not found");
            });
    }, [selectedStart, geocoder]);

    useEffect(() => {
        if (!geocoder || !selectedEnd) {
            setEndAddress("");
            return;
        }

        geocoder.geocode({ location: selectedEnd })
            .then((response) => {
                if (response.results[0]) {
                    setEndAddress(response.results[0].formatted_address);
                }
            })
            .catch((error) => {
                console.error("Error getting end address:", error);
                setEndAddress("Address not found");
            });
    }, [selectedEnd, geocoder]);

    return (
        <div className="absolute z-10 top-0 left-0 m-2 p-2 bg-white rounded-lg shadow-lg">
            <LocationInput setSelectedStart={setSelectedStart} />
            <CurrentLocationButton setSelectedStart={setSelectedStart} />
            <SubmitButton selectedStart={selectedStart} selectedEnd={selectedEnd} setRouteStart={setRouteStart} setRouteEnd={setRouteEnd} />
            <p>Selected Start: {startAddress || "No location selected"}</p>
            <p>Selected End: {endAddress || "No location selected"}</p>
        </div>
    );
}