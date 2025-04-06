"use client";

import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import Markers from "./Markers";
import Directions from "./Directions";
import StartMarker from "./StartMarker";
import { useState } from "react";
import foodBanks from "@/data/foodBanks";

interface MapComponentProps {
    selectedStart:  {lat: number, lng: number} | null
    selectedEnd: {lat: number, lng: number} | null
    setSelectedEnd: (selectedEnd: {lat: number, lng: number}) => void
    routeStart: {lat: number, lng: number} | null
    routeEnd: {lat: number, lng: number} | null
}

export default function MapComponent({selectedStart, selectedEnd, setSelectedEnd, routeStart, routeEnd }: MapComponentProps) {
  return (
    <div style={{ height: "100vh", width: "100%" }}>    
      <Map
        defaultCenter={{lat: -37.8136, lng: 144.9631}}
        defaultZoom={12}
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
        gestureHandling="greedy"
        disableDefaultUI={false}
      > 
        <Markers points={foodBanks} setSelectedEnd={setSelectedEnd} />
        <Directions routeStart={routeStart} routeEnd={routeEnd} />
        {selectedStart && <StartMarker selectedStart={selectedStart}/>}
      </Map>
    </div>
  );
} 