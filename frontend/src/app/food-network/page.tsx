"use client";

import MapComponent from "./MapComponent/index";
import { useLoadScript } from "@react-google-maps/api";
import LocationInput from "./LocationInput";
import { useState } from "react";
import CurrentLocationButton from "./CurrentLocationButton";
import SubmitButton from "./SubmitButton";
import { APIProvider } from "@vis.gl/react-google-maps";

const GOOGLE_MAPS_LIBRARIES: ("places" | "routes")[] = ["places", "routes"];
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function FoodNetwork() {
  // For user input and display
  const [selectedStart, setSelectedStart] = useState<{lat: number, lng: number} | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<{lat: number, lng: number} | null>(null);
  // For submission to fetch route
  const [routeStart, setRouteStart] = useState<{lat: number, lng: number} | null>(null);
  const [routeEnd, setRouteEnd] = useState<{lat: number, lng: number} | null>(null);
  // For loading the map
  
  const {isLoaded} = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
    <APIProvider apiKey={apiKey}>
      <LocationInput setSelectedStart={setSelectedStart} />
      <CurrentLocationButton setSelectedStart={setSelectedStart} />
      <SubmitButton selectedStart={selectedStart} selectedEnd={selectedEnd} setRouteStart={setRouteStart} setRouteEnd={setRouteEnd} />
      <p>Selected Start: {selectedStart?.lat}, {selectedStart?.lng}</p>
      <p>Selected End: {selectedEnd?.lat}, {selectedEnd?.lng}</p>
      <div>
        <MapComponent selectedStart={selectedStart} selectedEnd={selectedEnd} setSelectedEnd={setSelectedEnd} routeStart={routeStart} routeEnd={routeEnd} />
      </div>
    </APIProvider>
    </>
  );
}