"use client";

import { Map, useMap } from "@vis.gl/react-google-maps";
import Markers from "./Markers";
import Directions from "./Directions";
import StartMarker from "./StartMarker";
import { Dispatch, SetStateAction, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import type { Foodbank } from "@/app/api/foodbanks/route";
import WhereAmIButton from "./WhereAmIButton";
import { MapSectionState } from "@/app/food-network/interfaces";

type Point = google.maps.LatLngLiteral & { key: string };

interface MapComponentProps {
    mapSectionState: MapSectionState;
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>;
    selectedType: string;
    setMap: Dispatch<SetStateAction<google.maps.Map | null>>;
}

interface MapComponentRef {
  focusOnLocation: (location: {lat: number, lng: number}) => void;
}

const MapComponent = forwardRef<MapComponentRef, MapComponentProps>(({
    mapSectionState,
    setMapSectionState,
    selectedType,
    setMap,
}, ref) => {
  const map = useMap();
  const [foodBanks, setFoodBanks] = useState<Foodbank[]>([]);

  useImperativeHandle(ref, () => ({
    focusOnLocation: (location: {lat: number, lng: number}) => {
      if (map) {
        map.panTo(location);
        map.setZoom(12);
      }
    }
  }));

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
        console.error('Error fetching food banks:', err);
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
  
  // Effect to handle focusing on selected foodbank
  useEffect(() => {
    if ( mapSectionState.selectedEnd && map) {
      const selectedFoodBank = foodBanks.find(fb => fb.id.toString() === mapSectionState.selectedEnd);
      if (selectedFoodBank) {
        const location = {
          lat: selectedFoodBank.latitude,
          lng: selectedFoodBank.longitude
        };
        
        try {
          map.panTo(location);
          map.setZoom(15);
        } catch (e) {
          console.error("Error focusing map on foodbank:", e);
        }
      }
    }
  }, [mapSectionState.selectedEnd, map, foodBanks]);

  return (
      <Map
        defaultCenter={{lat: -37.8136, lng: 144.9631}}
        defaultZoom={12}
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
        gestureHandling="greedy"
        disableDefaultUI={false}
      > 
        <Markers points={points} setMapSectionState={setMapSectionState} mapSectionState={mapSectionState}/>
        {mapSectionState.routeStart && mapSectionState.routeEnd&& <Directions mapSectionState={mapSectionState} setMapSectionState={setMapSectionState} />}
        {mapSectionState.selectedStart && <StartMarker selectedStart={mapSectionState.selectedStart}/>}
        <WhereAmIButton />
      </Map>
  );
});

MapComponent.displayName = 'MapComponent';

export default MapComponent;