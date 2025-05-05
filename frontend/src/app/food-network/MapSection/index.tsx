/**
 * MapSection Component
 * 
 * This component provides an interactive map interface for food donation and waste disposal points.
 * It includes:
 * - Tab selection between Food Donation Points and Waste Disposal Points
 * - Interactive map display
 * - Route planning and navigation features
 * - Location selection and information display
 */
import { useState, Dispatch, SetStateAction, useEffect } from "react";
import MapComponent from "./MapComponent";
import Interaction from "./Interaction";
import { MapSectionState, ViewState } from "@/app/food-network/interfaces";

/**
 * Props interface for the MapSection component
 * @interface
 */
interface MapSectionProps {
    /** Current state of the map section */
    mapSectionState: MapSectionState;
    /** Function to update map section state */
    setMapSectionState: Dispatch<SetStateAction<MapSectionState>>;
    /** Currently selected point type */
    selectedType: string;
    /** Function to update selected point type */
    setSelectedType: Dispatch<SetStateAction<string>>;
    /** Current view state */
    viewState: ViewState;
    /** Function to update view state */
    setViewState: Dispatch<SetStateAction<ViewState>>;
}

/**
 * Renders the main map section with interactive features
 * 
 * @param {object} props - Component properties
 * @param {MapSectionState} props.mapSectionState - Current state of the map section
 * @param {Dispatch<SetStateAction<MapSectionState>>} props.setMapSectionState - Function to update map section state
 * @param {string} props.selectedType - Currently selected point type
 * @param {Dispatch<SetStateAction<string>>} props.setSelectedType - Function to update selected point type
 * @param {ViewState} props.viewState - Current view state
 * @param {Dispatch<SetStateAction<ViewState>>} props.setViewState - Function to update view state
 * @returns {JSX.Element} Rendered map section with interactive features
 */
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