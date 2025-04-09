"use client";

import { useLoadScript } from "@react-google-maps/api";
import { useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import Title from "./(components)/Title";
import MapSection from "./MapSection";
import FoodbankList from "./FoodbankList";
import FoodbankDetail from "./FoodbankDetail";

interface Foodbank {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  hours_of_operation: string;
  operation_schedule: {
    is_24_hours: boolean;
    days: string[];
    hours: string | null;
    raw_text: string;
  };
}

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

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="min-h-screen max-w-7xl mx-auto py-10 px-10">
      <Title heading="Food Network" description="Find the nearest food bank to you" />
      
      <APIProvider apiKey={apiKey}>
        <MapSection 
          selectedEnd={selectedEnd} 
          setSelectedEnd={setSelectedEnd}
        />
      </APIProvider>
      
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FoodbankList onSelectFoodbank={handleSelectFoodbank} />
        </div>
        
        <div>
          {selectedFoodbank ? (
            <FoodbankDetail foodbank={selectedFoodbank} />
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
              <h3 className="text-lg font-medium text-gray-900">No Foodbank Selected</h3>
              <p className="mt-2 text-gray-500">Select a foodbank from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}