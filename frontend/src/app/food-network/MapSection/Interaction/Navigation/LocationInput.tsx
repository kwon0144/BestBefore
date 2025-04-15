import { Dispatch, SetStateAction, useEffect } from "react";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { useMap } from "@vis.gl/react-google-maps";
import { Input } from "@heroui/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { MapSectionState } from "../../../interfaces";

interface LocationInputProps {
    mapSectionState: MapSectionState;
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>;
}

export default function LocationInput({ mapSectionState, setMapSectionState }: LocationInputProps) {
    const map = useMap();

    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            // Bias results around Melbourne CBD
            location: new google.maps.LatLng(-37.8136, 144.9631),
            radius: 10000, // in meters
            componentRestrictions: { country: "au" }, // Australia only
        },
        debounce: 300,
    });

    // Update input value when currentLocationAddress changes
    useEffect(() => {
        if (mapSectionState.currentLocationAddress) {
            setValue(mapSectionState.currentLocationAddress, false);
        }
    }, [mapSectionState.currentLocationAddress, setValue]);

    const handleSelect = async (address: string) => {
        setValue(address, false);
        clearSuggestions();
        const results = await getGeocode({ address });
        const { lat, lng } = await getLatLng(results[0]);
        setMapSectionState(prev => ({...prev, selectedStart: { lat, lng }}));
        map?.panTo({ lat: lat, lng: lng });
        map?.setZoom(15);
    };

    const onHandleClear = () => {
        setValue("", false);
        setMapSectionState(prev => ({...prev, selectedStart: null, currentLocationAddress: "" }));
    };

    return (
        <div className="relative w-full max-w-md">
            {/* Autocomplete Location Input */}
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={!ready}
                placeholder="Search"
                startContent={<FontAwesomeIcon icon={faSearch} />}
                isClearable={true}
                onClear={() => onHandleClear()}
            />
            {status === "OK" && (
                <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <ul className="py-2 max-h-[300px] overflow-auto">
                        {data.map(({ place_id, description }) => (
                            <li
                                key={place_id}
                                onClick={() => handleSelect(description)}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                            >
                                {description}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}