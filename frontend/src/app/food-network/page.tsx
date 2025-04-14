"use client";

import { useLoadScript } from "@react-google-maps/api";
import { useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import Title from "../(components)/Title";
import MapSection from "./MapSection";
import DonationDisposalOptions from "./DonationDisposalOptions";
import FoodNetworkList from "./FoodNetworkList";
const GOOGLE_MAPS_LIBRARIES: ("places" | "routes")[] = ["places", "routes"];
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export interface ViewState {
  showInformation: boolean;
  showNavigation: boolean;
  showRouteResult: boolean;
}

export type TravelMode = "WALKING" | "TRANSIT" | "BICYCLING" | "DRIVING";

export interface MapSectionState {
  selectedEnd: string | null;
  selectedStart: {lat: number, lng: number} | null;
  routeStart: {lat: number, lng: number} | null;
  routeEnd: {lat: number, lng: number} | null;
  routeDetails: {duration: string, distance: string};
  travellingMode: TravelMode;   
}

export default function FoodNetwork() {
  // For type selection
  const [selectedType, setSelectedType] = useState<string>("Food Donation Points");
  // For user input and display
  const [mapSectionState, setMapSectionState] = useState<MapSectionState>({
    selectedEnd: "1", 
    selectedStart: null,
    routeStart: null,
    routeEnd: null,
    routeDetails: {duration: "", distance: ""},
    travellingMode: "WALKING",
  });
  // For the map instance
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // For loading the map
  const {isLoaded} = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES
  });
  // For the view state
  const [viewState, setViewState] = useState<ViewState>({
    showInformation: true,
    showNavigation: false,
    showRouteResult: false,
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
      <DonationDisposalOptions />
      <APIProvider apiKey={apiKey}>
        <div className="mb-20">
          <MapSection 
            mapSectionState={mapSectionState}
            setMapSectionState={setMapSectionState}
            onMapReady={handleMapReady}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            viewState={viewState}
            setViewState={setViewState}
          />
        </div>
        <div>
          <div>
            <FoodNetworkList 
              setMapSectionState={setMapSectionState}
              map={map}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              setViewState={setViewState}
            />
          </div>
        </div>
      </APIProvider>
    </div>
  );
}