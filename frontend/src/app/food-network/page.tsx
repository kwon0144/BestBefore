"use client";

import { useLoadScript } from "@react-google-maps/api";
import { useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import Title from "../(components)/Title";
import MapSection from "./MapSection";
import FoodNetworkList from "./FoodNetworkList"

const GOOGLE_MAPS_LIBRARIES: ("places" | "routes")[] = ["places", "routes"];
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function FoodNetwork() {
  // For user input and display
  const [selectedEnd, setSelectedEnd] = useState<string | null>("1");
  // For the map instance
  const [map, setMap] = useState<google.maps.Map | null>(null);
  // For type selection
  const [selectedType, setSelectedType] = useState<string>("Food Donation Points");
  // For display
  const [showInformation, setShowInformation] = useState<boolean>(true);
  const [showNavigation, setShowNavigation] = useState<boolean>(false);
  const [showRouteResult, setShowRouteResult] = useState<boolean>(false);
  // For loading the map
  const {isLoaded} = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES
  });

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
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            showInformation={showInformation}
            showNavigation={showNavigation}
            showRouteResult={showRouteResult}
            setShowInformation={setShowInformation}
            setShowNavigation={setShowNavigation}
            setShowRouteResult={setShowRouteResult}
          />
        </div>
        <div>
          <div>
            <FoodNetworkList 
              setSelectedEnd={setSelectedEnd} 
              map={map}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              setShowInformation={setShowInformation}
              setShowNavigation={setShowNavigation}
              setShowRouteResult={setShowRouteResult}
            />
          </div>
        </div>
      </APIProvider>
    </div>
  );
}