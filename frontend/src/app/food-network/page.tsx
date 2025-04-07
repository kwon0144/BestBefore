"use client";

import { useLoadScript } from "@react-google-maps/api";
import { useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import Title from "../(components)/Title";
import MapSection from "./MapSection";


const GOOGLE_MAPS_LIBRARIES: ("places" | "routes")[] = ["places", "routes"];
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function FoodNetwork() {
  // For user input and display
  const [selectedEnd, setSelectedEnd] = useState<string | null>("1");
  // For loading the map
  const {isLoaded} = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="min-h-screen max-w-7xl mx-auto py-30 px-10">
      <Title heading="Food Network" description="Find the nearest food bank to you" />
      <APIProvider apiKey={apiKey}>
        <MapSection selectedEnd={selectedEnd} setSelectedEnd={setSelectedEnd} />
      </APIProvider>
    </div>
  );
}