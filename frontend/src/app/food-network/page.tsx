"use client";

import Map from "./Map/index";
import { useLoadScript } from "@react-google-maps/api";
import LocationInput from "./Map/LocationInput";
import { useState } from "react";
import CurrentLocationButton from "./Map/CurrentLocationButton";

export default function FoodNetwork() {
  const [selectedStart, setSelectedStart] = useState<{lat: number, lng: number} | null>(null);
  const {isLoaded} = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places', 'routes']
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      <LocationInput setSelected={setSelectedStart} />
      <CurrentLocationButton setSelected={setSelectedStart} />
      <div>
        <Map selectedStart={selectedStart} />
      </div>
    </>
  );
}