"use client";

import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import Markers from "./Markers";
import Directions from "./Directions";
import StartMarker from "./StartMarker";
import foodBanks from "@/data/foodBanks";
import { Dispatch, SetStateAction } from "react";

interface MapComponentProps {
    selectedStart:  {lat: number, lng: number} | null
    setSelectedEnd: Dispatch<SetStateAction<string | null>>
    routeStart: {lat: number, lng: number} | null
    routeEnd: {lat: number, lng: number} | null
    setRouteDetails: Dispatch<SetStateAction<{duration: string, distance: string}>>
    travellingMode: string
}

export default function MapComponent({selectedStart, setSelectedEnd, routeStart, routeEnd, setRouteDetails, travellingMode }: MapComponentProps) {
  return (
      <Map
        defaultCenter={{lat: -37.8136, lng: 144.9631}}
        defaultZoom={12}
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
        gestureHandling="greedy"
        disableDefaultUI={false}
      > 
        <Markers points={foodBanks} setSelectedEnd={setSelectedEnd} />
        {selectedStart && travellingMode && <Directions routeStart={routeStart} routeEnd={routeEnd} setRouteDetails={setRouteDetails} travellingMode={travellingMode} />}
        {selectedStart && <StartMarker selectedStart={selectedStart}/>}
      </Map>
  );
} 