"use client";

import { useMap, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { Marker } from "@googlemaps/markerclusterer";
import { useEffect, useState, useRef, SetStateAction, Dispatch } from "react";

type Point = google.maps.LatLngLiteral & { key: string};

interface Props { 
  points: Point[]
  setSelectedEnd: Dispatch<SetStateAction<string | null>>
  selectedType: string
}

export default function Markers({ points, setSelectedEnd, selectedType }: Props) {
  const map = useMap();
  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
  const clusterer = useRef<MarkerClusterer | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
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
    setSelectedKey(point.key);
    map?.panTo({ lat: point.lat, lng: point.lng });
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
          {selectedKey === point.key ?
            <Pin
              glyph="D"
              background="green" 
              borderColor="white"
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