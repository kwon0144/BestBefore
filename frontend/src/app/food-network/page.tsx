"use client";

import { useLoadScript } from "@react-google-maps/api";
import { useState, useRef } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import Title from "../(components)/Title";
import MapSection from "./MapSection";
import DonationDisposalOptions from "./DonationDisposalOptions";
import FoodNetworkList from "./FoodNetworkList";
import { MapSectionState, ViewState } from "./interfaces";

const GOOGLE_MAPS_LIBRARIES: ("places" | "routes")[] = ["places", "routes"];
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

/**
 * FoodNetwork Component
 * 
 * This is the main component for the Food Network page that displays donation points and disposal options.
 * It integrates with Google Maps API to show locations and provide route planning functionality.
 * The component manages different view states for information display, navigation, and route results.
 * 
 * @returns {JSX.Element} The rendered Food Network page with map integration and location listing
 */
export default function FoodNetwork() {
  /**
   * State for tracking the selected type of location
   * @type {string} The currently selected location type (e.g., "Food Donation Points")
   */
  const [selectedType, setSelectedType] = useState<string>("Food Donation Points");
  
  /**
   * State for managing map-related data and routing information
   * @type {MapSectionState} Contains:
   * - selectedEnd: The selected destination point
   * - selectedStart: The selected starting point
   * - routeStart: The actual route starting coordinates
   * - routeEnd: The actual route ending coordinates
   * - routeDetails: Object containing duration and distance information
   * - travellingMode: The selected mode of transportation
   * - currentLocationAddress: The formatted address of current location
   */
  const [mapSectionState, setMapSectionState] = useState<MapSectionState>({
    selectedEnd: "1", 
    selectedStart: null,
    routeStart: null,
    routeEnd: null,
    routeDetails: {duration: "", distance: ""},
    travellingMode: "WALKING",
    currentLocationAddress: ""
  });

  /**
   * Google Maps API initialization
   * @type {Object} Contains loading state and API configuration
   */
  const {isLoaded} = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  /**
   * State for controlling the visibility of different UI sections
   * @type {ViewState} Contains:
   * - showInformation: Controls visibility of information panel
   * - showNavigation: Controls visibility of navigation interface
   * - showRouteResult: Controls visibility of route results
   */
  const [viewState, setViewState] = useState<ViewState>({
    showInformation: true,
    showNavigation: false,
    showRouteResult: false,
  });

  /**
   * Reference to the map section for scrolling
   */
  const mapSectionRef = useRef<HTMLDivElement>(null);

  /**
   * Scrolls to the map section
   * Includes an offset to account for the navigation bar
   */
  const scrollToMapSection = () => {
    if (mapSectionRef.current) {
      // Get the element's position
      const elementPosition = mapSectionRef.current.getBoundingClientRect().top;
      // Get the current scroll position
      const offsetPosition = elementPosition + window.pageYOffset - 80; // 80px offset for nav bar
      
      // Scroll to the element with the offset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div>
      {/* Page header with title and background image */}
      <div className="py-12">
        <Title 
        heading="Food Network" 
        description="Contribute to the community by donation or efficient disposal" 
        background="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/foodnetwork-titlebg.jpeg"
        />
      </div>
      {/* Main content container */}
      <div className="min-h-screen max-w-7xl mx-auto px-10">
        {/* Donation and disposal options section */}
        <div className="py-8">
          <h2 className="text-3xl md:text-4xl font-bold text-darkgreen text-center mb-12">
            What are the options?
          </h2>
          <DonationDisposalOptions />
        </div>
        {/* Google Maps integration - only renders when API is loaded */}
        {isLoaded && (
          <APIProvider apiKey={apiKey}>
            {/* Map section for location selection and route planning */}
            <div className="mt-8" ref={mapSectionRef}>
              <h2 className="text-3xl md:text-4xl font-bold text-darkgreen text-center mb-12">
                Where is it?
              </h2>
              <MapSection 
                mapSectionState={mapSectionState}
                setMapSectionState={setMapSectionState}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                viewState={viewState}
                setViewState={setViewState}
              />
            </div>
            {/* List of food network locations */}
            <div>
              <div className="mt-20 mb-20">
                <FoodNetworkList 
                  setMapSectionState={setMapSectionState}
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  setViewState={setViewState}
                  scrollToMapSection={scrollToMapSection}
                />
              </div>
            </div>
          </APIProvider>
        )}
      </div>
    </div>
  );
}