"use client";

import { useMap, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { Marker } from "@googlemaps/markerclusterer";
import { useEffect, useState, useRef } from "react";

type Point = google.maps.LatLngLiteral & { key: string };
type Props = { points: Point[] };

export default function Markers({ points }: Props) {
  const map = useMap();
  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
  const clusterer = useRef<MarkerClusterer | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);

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
    setSelectedPoint(point);
  };

  return (
    <>
      {points.map((point) => (
        <AdvancedMarker
          position={point}
          key={point.key}
          ref={(marker) => {
            setMarkerRef(marker, point.key);
            marker?.addEventListener('gmp-click', () => handleMarkerClick(point));
          }}
        >
          <Pin background="green" borderColor="white" glyphColor="white" />
        </AdvancedMarker>
      ))}
      {selectedPoint && (
        <InfoWindow
          position={selectedPoint}
          onCloseClick={() => setSelectedPoint(null)}
        >
          <div>Info Window</div>
        </InfoWindow>
      )}
    </>
  );
} 