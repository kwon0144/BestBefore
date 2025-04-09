"use client";

import { useLoadScript } from "@react-google-maps/api";
import { useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import Title from "../(components)/Title";
import MapSection from "./MapSection";
import FoodNetworkList from "./FoodNetworkList"
import { Foodbank } from "@/app/api/foodbanks/route";

const GOOGLE_MAPS_LIBRARIES: ("places" | "routes")[] = ["places", "routes"];
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function FoodNetwork() {
  // For user input and display
  const [selectedEnd, setSelectedEnd] = useState<string | null>("1");
  // For selecting a foodbank
  const [selectedFoodbank, setSelectedFoodbank] = useState<Foodbank | null>(null);
  // For the map instance
  const [map, setMap] = useState<google.maps.Map | null>(null);
  // For loading the map
  const {isLoaded} = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  const handleSelectFoodbank = (foodbank: Foodbank) => {
    setSelectedFoodbank(foodbank);
  };

  const handleMapReady = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  };

  if (!isLoaded) return (
    <div className="min-h-screen max-w-7xl mx-auto py-20 px-10">
      <Title heading="Food Network" description="Contribute to the community by donation or efficient disposal" />
      <div>Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen max-w-7xl mx-auto py-20 px-10">
      <Title heading="Food Network" description="Contribute to the community by donation or efficient disposal" />
      <APIProvider apiKey={apiKey}>
        <div className="mb-20">
          <MapSection 
            selectedEnd={selectedEnd} 
            setSelectedEnd={setSelectedEnd}
            onMapReady={handleMapReady}
          />
        </div>
        <div>
          <div>
            <FoodNetworkList 
              onSelectFoodbank={handleSelectFoodbank} 
              setSelectedEnd={setSelectedEnd} 
              map={map}
            />
          </div>
        </div>
      </APIProvider>
    </div>
  );
}