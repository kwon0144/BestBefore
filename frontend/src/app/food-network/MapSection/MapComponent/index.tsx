"use client";

import { Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import Markers from "./Markers";
import Directions from "./Directions";
import StartMarker from "./StartMarker";
import { Dispatch, SetStateAction, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import type { Foodbank } from "@/app/api/foodbanks/route";

type Point = google.maps.LatLngLiteral & { key: string };

interface MapComponentProps {
    selectedStart: {lat: number, lng: number} | null;
    setSelectedEnd: Dispatch<SetStateAction<string | null>>;
    routeStart: {lat: number, lng: number} | null;
    routeEnd: {lat: number, lng: number} | null;
    setRouteDetails: Dispatch<SetStateAction<{duration: string, distance: string}>>;
    travellingMode: string;
    selectedFoodbank?: Foodbank | null;
    selectedType: string;
    setMap: Dispatch<SetStateAction<google.maps.Map | null>>;
}

const MapComponent = forwardRef<any, MapComponentProps>(({
    selectedStart, 
    setSelectedEnd, 
    routeStart, 
    routeEnd, 
    setRouteDetails, 
    travellingMode,
    selectedFoodbank,
    selectedType,
    setMap
}, ref) => {
  const map = useMap();
  const [foodBanks, setFoodBanks] = useState<Foodbank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (map) {
      setMap(map);
    }
  }, [map, setMap]);

  useEffect(() => {
    const fetchFoodBanks = async () => {
      try {
        const response = await fetch('/api/foodbanks');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Filter based on selectedType
        const filteredFoodBanks = data.data.filter((foodbank: Foodbank) => 
          selectedType === "Food Donation Points" 
            ? foodbank.type === "Food Donation Point"
            : foodbank.type !== "Food Donation Point"
        );
        setFoodBanks(filteredFoodBanks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch food banks');
        console.error('Error fetching food banks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFoodBanks();
  }, [selectedType]);
  
  // Transform food banks into points for the Markers component
  const points: Point[] = foodBanks.map(foodbank => ({
    lat: foodbank.latitude,
    lng: foodbank.longitude,
    key: foodbank.id.toString(),
    id: foodbank.id,
    name: foodbank.name,
    type: foodbank.type === "Food Donation Point" ? "Food Donation Point" : "Waste Disposal Point",
    address: foodbank.address,
    hours_of_operation: foodbank.hours_of_operation,
    operation_schedule: foodbank.operation_schedule
  }));
  
  // Expose methods to parent through useImperativeHandle
  useImperativeHandle(ref, () => ({
    focusOnLocation: (location: {lat: number, lng: number}) => {
      if (map) {
        map.panTo(location);
        map.setZoom(15);
      }
    }
  }));
  
  // Effect to handle focusing on selected foodbank
  useEffect(() => {
    if (selectedFoodbank && map) {
      const location = {
        lat: selectedFoodbank.latitude,
        lng: selectedFoodbank.longitude
      };
      
      try {
        map.panTo(location);
        map.setZoom(15);
      } catch (e) {
        console.error("Error focusing map on foodbank:", e);
      }
    }
  }, [selectedFoodbank, map]);

  return (
      <Map
        defaultCenter={{lat: -37.8136, lng: 144.9631}}
        defaultZoom={12}
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
        gestureHandling="greedy"
        disableDefaultUI={false}
      > 
        <Markers points={points} setSelectedEnd={setSelectedEnd} selectedType={selectedType}/>
        {/* Add a special marker for the selected foodbank if it exists */}
        {selectedFoodbank && (
          <AdvancedMarker
            position={{lat: selectedFoodbank.latitude, lng: selectedFoodbank.longitude}}
            title={selectedFoodbank.name}
          >
            <Pin
              background={"#22c55e"} // Green color for selected foodbank
              borderColor={"#166534"}
              glyphColor={"#ffffff"}
              scale={1.2} // Slightly larger than regular pins
            />
          </AdvancedMarker>
        )}
        {selectedStart && travellingMode && <Directions routeStart={routeStart} routeEnd={routeEnd} setRouteDetails={setRouteDetails} travellingMode={travellingMode} />}
        {selectedStart && <StartMarker selectedStart={selectedStart}/>}
      </Map>
  );
});

// Add display name for React DevTools
MapComponent.displayName = "MapComponent";

export default MapComponent;