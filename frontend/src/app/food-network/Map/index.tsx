"use client";

import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import Markers from "./Markers";
import foodBanks from "@/data/foodBanks";
import Directions from "./Directions";
import StartMarker from "./StartMarker";
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const melbourne = { lat: -37.8136, lng: 144.9631 };

interface MapComponentProps {
    selectedStart:  {lat: number, lng: number} | null
}

export default function MapComponent({ selectedStart }: MapComponentProps) {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={melbourne}
          defaultZoom={12}
          mapId={process.env.NEXT_PUBLIC_MAP_ID}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          <Markers points={foodBanks} />
          <Directions />
          {selectedStart && <StartMarker selectedStart={selectedStart} />}
        </Map>
      </APIProvider>
    </div>
  );
} 