"use client";

import { useLoadScript } from "@react-google-maps/api";
import { useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import Title from "./(components)/Title";
import MapSection from "./MapSection";
import FoodNetworkList from "./MapSection/Interaction/FoodNetworkList";
import { Foodbank } from "../api/foodbanks/route";

const GOOGLE_MAPS_LIBRARIES: ("places" | "routes")[] = ["places", "routes"];
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function FoodNetwork() {
  // For user input and display
  const [selectedEnd, setSelectedEnd] = useState<string | null>("1");
  // For selecting a foodbank
  const [selectedFoodbank, setSelectedFoodbank] = useState<Foodbank | null>(null);
  // For loading the map
  const {isLoaded} = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  const handleSelectFoodbank = (foodbank: Foodbank) => {
    setSelectedFoodbank(foodbank);
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
        <MapSection 
          selectedEnd={selectedEnd} 
          setSelectedEnd={setSelectedEnd}
        />
      </APIProvider>
      
      {/* <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6"> */}
        <div className="lg:col-span-2">
          <FoodNetworkList onSelectFoodbank={handleSelectFoodbank} />
        </div>
        
        {/* <div>
          {selectedFoodbank ? (
            <FoodbankDetail foodbank={selectedFoodbank} />
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
              <h3 className="text-lg font-medium text-gray-900">No Foodbank Selected</h3>
              <p className="mt-2 text-gray-500">Select a foodbank from the list to view details</p>
            </div>
          )}
        </div> */}
      {/* </div> */}
    </div>
  );
}