"use client";

import { useLoadScript } from "@react-google-maps/api";
import { useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import Title from "../(components)/Title";
import MapSection from "./MapSection";
import DonationDisposalOptions from "./DonationDisposalOptions";
import FoodNetworkList from "./FoodNetworkList";
import { MapSectionState, ViewState } from "./interfaces";
const GOOGLE_MAPS_LIBRARIES: ("places" | "routes")[] = ["places", "routes"];
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

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
    currentLocationAddress: ""
  });

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