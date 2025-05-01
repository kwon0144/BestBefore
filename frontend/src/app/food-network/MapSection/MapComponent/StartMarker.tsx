/**
 * StartMarker Component
 * 
 * This component renders a marker on the map indicating the starting point of a route.
 * It uses a custom styled pin with an 'S' glyph to distinguish it from other markers.
 */
"use client";

import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

/**
 * Props interface for the StartMarker component
 * @interface
 */
interface StartMarkerProps {
    /** The coordinates of the starting point */
    selectedStart: {lat: number, lng: number}
}

/**
 * Renders a marker indicating the starting point of a route
 * 
 * @param {StartMarkerProps} props - Component properties
 * @returns {JSX.Element} A marker component with a custom styled pin
 */
export default function StartMarker({ selectedStart }: StartMarkerProps) {
    return (
        <AdvancedMarker position={selectedStart}>            
            <Pin
                glyph="S"
                background="#fc9003" 
                borderColor="#964B00"
                glyphColor="white"
                scale={1.5}
            />
        </AdvancedMarker>
    )
}
