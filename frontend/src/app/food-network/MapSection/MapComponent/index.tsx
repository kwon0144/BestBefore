"use client";

import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import Markers from "./Markers";
import Directions from "./Directions";
import StartMarker from "./StartMarker";
import foodBanks from "@/data/foodBanks";
import { Dispatch, SetStateAction, useRef, useEffect, forwardRef, useImperativeHandle } from "react";

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

interface MapComponentProps {
    selectedStart: {lat: number, lng: number} | null;
    setSelectedEnd: Dispatch<SetStateAction<string | null>>;
    routeStart: {lat: number, lng: number} | null;
    routeEnd: {lat: number, lng: number} | null;
    setRouteDetails: Dispatch<SetStateAction<{duration: string, distance: string}>>;
    travellingMode: string;
    selectedFoodbank?: Foodbank | null; // Add the new prop
}

const MapComponent = forwardRef<any, MapComponentProps>(({
    selectedStart, 
    setSelectedEnd, 
    routeStart, 
    routeEnd, 
    setRouteDetails, 
    travellingMode,
    selectedFoodbank
}, ref) => {
  // Reference to the Map component
  const mapRef = useRef<any>(null);
  
  // Expose methods to parent through useImperativeHandle
  useImperativeHandle(ref, () => ({
    focusOnLocation: (location: {lat: number, lng: number}) => {
      if (mapRef.current) {
        // For @vis.gl/react-google-maps, you need to set the map's center and zoom
        // This is an approximation - adjust as needed based on map library specifics
        mapRef.current.panTo(location);
        mapRef.current.setZoom(15);
      }
    }
  }));
  
  // Effect to handle focusing on selected foodbank
  useEffect(() => {
    if (selectedFoodbank && mapRef.current) {
      const location = {
        lat: selectedFoodbank.latitude,
        lng: selectedFoodbank.longitude
      };
      
      // The map object may have slightly different methods depending on your implementation
      // Adjust these method names as needed
      try {
        mapRef.current.panTo(location);
        mapRef.current.setZoom(15);
      } catch (e) {
        console.error("Error focusing map on foodbank:", e);
      }
    }
  }, [selectedFoodbank]);

  return (
      <Map
        ref={mapRef}
        defaultCenter={{lat: -37.8136, lng: 144.9631}}
        defaultZoom={12}
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
        gestureHandling="greedy"
        disableDefaultUI={false}
      > 
        <Markers points={foodBanks} setSelectedEnd={setSelectedEnd} />
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