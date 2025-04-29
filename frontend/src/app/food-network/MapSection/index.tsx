import { useState, Dispatch, SetStateAction, useEffect } from "react";
import MapComponent from "./MapComponent";
import Interaction from "./Interaction";
import { MapSectionState, ViewState } from "@/app/food-network/interfaces";


interface MapSectionProps {
    mapSectionState: MapSectionState;
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>;
    selectedType: string;
    setSelectedType: Dispatch<SetStateAction<string>>;
    viewState: ViewState;
    setViewState: Dispatch<SetStateAction<ViewState>>;
}

export default function MapSection({mapSectionState, setMapSectionState, selectedType, setSelectedType, viewState, setViewState}: MapSectionProps) {
  // For submission to fetch route
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Add effect to reset route states when showInformation becomes true
  useEffect(() => {
    if (viewState.showInformation || viewState.showNavigation) {
      setMapSectionState(prevState => ({
        ...prevState,
        selectedStart: null,
        routeStart: null,
        routeEnd: null,
        routeDetails: {duration: "", distance: ""},
        currentLocationAddress: ""
      }));
    }
  }, [viewState.showInformation, viewState.showNavigation, setMapSectionState]);

  const handleTypeSelection = (selection: string) => {
    if (selection !== selectedType) {
        // Reset view states to Information Section
        setViewState({
            showInformation: true,
            showNavigation: false,
            showRouteResult: false,
        });
        // Reset route states and set selected end
        setMapSectionState({
          ...mapSectionState,
          selectedStart: null,
          routeStart: null,
          routeEnd: null,
          routeDetails: {duration: "", distance: ""},
          selectedEnd: selection === "Food Donation Points" ? "1" : "50",
          currentLocationAddress: ""
        });
        setSelectedType(selection);
        // Reset map zoom and center
        if (map) {
            map.setZoom(12);
        }   
    }
  };

  return (
    <div>
        {/* tab selection */}
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
        {/* map and interaction */}
        <div className={`flex flex-col md:flex-row w-full h-auto md:h-[600px] pt-10 pb-10 px-10 rounded-b-2xl gap-10 md:gap-0 ${selectedType=="Food Donation Points" ? "bg-green/30 rounded-tr-2xl" : "bg-[#b0ebc4]/50 rounded-tl-2xl"}`}>
            <div className="w-full md:w-3/5 h-[400px] md:h-full">
                <MapComponent 
                    mapSectionState={mapSectionState}
                    setMapSectionState={setMapSectionState}
                    selectedType={selectedType}
                    setMap={setMap}
                />
            </div>
            <div className="w-full md:w-2/5 md:pl-5">
                <Interaction 
                    mapSectionState={mapSectionState}
                    setMapSectionState={setMapSectionState}
                    viewState={viewState}
                    setViewState={setViewState}
                    selectedType={selectedType}
                />
            </div>
        </div>
    </div>
  );
}