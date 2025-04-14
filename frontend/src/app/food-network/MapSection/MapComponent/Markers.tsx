"use client";

import { useMap, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { Marker } from "@googlemaps/markerclusterer";
import { useEffect, useState, useRef, SetStateAction, Dispatch } from "react";

type Point = google.maps.LatLngLiteral & { key: string};

interface Props { 
  points: Point[]
  setSelectedEnd: Dispatch<SetStateAction<string | null>>
  selectedEnd: string | null
}

export default function Markers({ points, setSelectedEnd, selectedEnd }: Props) {
  const map = useMap();
  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
  const clusterer = useRef<MarkerClusterer | null>(null);
  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }
  }, [map]);

  useEffect(() => {
    clusterer.current?.clearMarkers();
    clusterer.current?.addMarkers(Object.values(markers));
  }, [markers]);

  const setMarkerRef = (marker: Marker | null, key: string) => {
    if (marker && markers[key]) return;
    if (!marker && !markers[key]) return;

    setMarkers((prev) => {
      if (marker) {
        return { ...prev, [key]: marker };
      } else {
        const newMarkers = { ...prev };
        delete newMarkers[key];
        return newMarkers;
      }
    });
  };

  const handleMarkerClick = (point: Point) => {
    setSelectedEnd(point.key);  
  };

  return (
    <>
      {points.map((point) => (
        <AdvancedMarker
          position={point}
          key={point.key}
          onClick={() => handleMarkerClick(point)}
          clickable={true}
          ref={(marker) => {
            setMarkerRef(marker, point.key);
          }}
        >
          {selectedEnd === point.key ?
            <Pin
              glyph="D"
              background="#fc9003" 
              borderColor="#964B00"
              glyphColor="white"
              scale={1.5}
            />:
            <Pin
              background="green" 
              borderColor="white"
              glyphColor="white"
            />
          }
        </AdvancedMarker>
      ))}
    </>
  );
} 