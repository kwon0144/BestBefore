"use client";

import MapComponent from "./MapComponent/index";
import { useLoadScript } from "@react-google-maps/api";
import { useState } from "react";
import MapControl from "./MapControl/index";
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
      <div className="absolute z-10 top-50 left-0 m-2 p-2 bg-white rounded-lg shadow-lg">
        <MapControl 
          setSelectedStart={setSelectedStart} 
          setSelectedEnd={setSelectedEnd} 
          setRouteStart={setRouteStart} 
          setRouteEnd={setRouteEnd}
          selectedStart={selectedStart}
          selectedEnd={selectedEnd}
        />
      </div>
      <div>
        <MapComponent selectedStart={selectedStart} selectedEnd={selectedEnd} setSelectedEnd={setSelectedEnd} routeStart={routeStart} routeEnd={routeEnd} />
      </div>
    </APIProvider>
    </>
  );
}