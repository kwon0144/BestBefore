import { useState, Dispatch, SetStateAction } from "react";
import MapComponent from "./MapComponent";
import Interaction from "./Interaction";

interface MapSectionProps {
    selectedEnd: string | null;
    setSelectedEnd: Dispatch<SetStateAction<string | null>>;
}

export default function MapSection({selectedEnd, setSelectedEnd}: MapSectionProps) {
  // For user input and display
  const [selectedStart, setSelectedStart] = useState<{lat: number, lng: number} | null>(null);
  // For submission to fetch route
  const [routeStart, setRouteStart] = useState<{lat: number, lng: number} | null>(null);
  const [routeEnd, setRouteEnd] = useState<{lat: number, lng: number} | null>(null);    
  const [routeDetails, setRouteDetails] = useState<{duration: string, distance: string}>({duration: "", distance: ""});
  const [travellingMode, setTravellingMode] = useState<string>("driving");

 return (
    <div className="flex flex-row w-full h-[600px] bg-green/30 py-10 px-10 rounded-lg shadow-lg">
        <div className="w-3/5">
            <MapComponent 
                selectedStart={selectedStart} 
                setSelectedEnd={setSelectedEnd} 
                routeStart={routeStart} 
                routeEnd={routeEnd} 
                setRouteDetails={setRouteDetails}
                travellingMode={travellingMode}
            />
        </div>
        <div className="w-2/5">
            <Interaction 
                selectedEnd={selectedEnd}
                selectedStart={selectedStart}
                setSelectedStart={setSelectedStart}
                setRouteStart={setRouteStart}
                setRouteEnd={setRouteEnd}
                routeDetails={routeDetails}
                setTravellingMode={setTravellingMode}
            />
        </div>
    </div>
    )
}