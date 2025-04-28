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

  return (
    <div>
      <div className="py-16">
        <Title 
        heading="Food Network" 
        description="Contribute to the community by donation or efficient disposal" 
        background="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/foodnetwork-titlebg.png"
        />
      </div>
      <div className="min-h-screen max-w-7xl mx-auto px-10">
        <div className="mt-10">
          <DonationDisposalOptions />
        </div>
        <APIProvider apiKey={apiKey}>
          <div className="mt-20">
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
            <div className="mt-20">
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
    </div>
  );
}