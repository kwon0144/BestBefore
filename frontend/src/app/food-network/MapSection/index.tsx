import { useState, Dispatch, SetStateAction } from "react";
import MapComponent from "./MapComponent";
import Interaction from "./Interaction";
import { TravelMode } from "./Interaction/Navigation/TravelModeSelection";

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
  const [travellingMode, setTravellingMode] = useState<TravelMode>("DRIVING");
  const [selectedType, setSelectedType] = useState<string>("Food Donation Points");

  const handleTypeSelection = (selection: string) => {
    if (selection !== selectedType) {
      setSelectedType(selection);
    }
  };

 return (
    <>
        <div className="flex flex-row w-full ">
            <div className={`flex flex-row w-1/2 py-2 px-10 rounded-t-full ${selectedType === "Food Donation Points" ? "bg-green/30" : "bg-transparent"}`}></div>
            <div className={`flex flex-row w-1/2 py-2 px-10 rounded-t-full ${selectedType === "Food Donation Points" ? "bg-transparent" : "bg-[#b0ebc4]/50"}`}></div>
        </div>
        <div className="flex flex-row">
            <div className={`flex flex-row w-1/2 ${selectedType === "Food Donation Points" ? "" : "pl-5"}`}>
                <div 
                    className={`flex flex-row w-full bg-green/30 py-2 px-10 justify-center ${selectedType === "Food Donation Points" ? "font-semibold" : "cursor-pointer rounded-t-2xl"}`}
                    onClick={() => handleTypeSelection("Food Donation Points")}
                >Food Bank Donation Points</div>
            </div>
            <div className={`flex flex-row w-1/2 ${selectedType === "Food Donation Points" ? "pr-5" : ""}`}>
                <div 
                className={`flex flex-row w-full bg-[#b0ebc4]/50 py-2 px-10  justify-center ${selectedType === "Food Donation Points" ? "cursor-pointer rounded-t-2xl" : "font-semibold"}`}
                onClick={() => handleTypeSelection("Waste Disposal Points")}
            >Green Waste Disposal Points</div>
            </div>
        </div>
        <div className={`flex flex-row w-full pt-10 pb-10 px-10 rounded-b-2xl ${selectedType=="Food Donation Points" ? "bg-green/30 rounded-tr-2xl" : "bg-[#b0ebc4]/50 rounded-tl-2xl"}`}>
            <div className="w-3/5">
                <MapComponent 
                    selectedStart={selectedStart} 
                    setSelectedEnd={setSelectedEnd} 
                    routeStart={routeStart} 
                    routeEnd={routeEnd} 
                    setRouteDetails={setRouteDetails}
                    travellingMode={travellingMode}
                    selectedType={selectedType}
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
                    travellingMode={travellingMode}
                />
            </div>
        </div>
    </>
    )
}