"use client";

import { APIProvider, Map } from "@vis.gl/react-google-maps";
import Markers from "./Markers";
import foodBanks from "@/data/foodBanks";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const melbourne = { lat: -37.8136, lng: 144.9631 };

export default function MapComponent() {
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
        </Map>
      </APIProvider>
    </div>
  );
} 