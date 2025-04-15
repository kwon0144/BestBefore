import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

interface StartMarkerProps {
    selectedStart: {lat: number, lng: number}
}

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
