import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

interface StartMarkerProps {
    selectedStart: {lat: number, lng: number}
}

export default function StartMarker({ selectedStart }: StartMarkerProps) {
    return <AdvancedMarker position={selectedStart}><Pin/></AdvancedMarker>
}