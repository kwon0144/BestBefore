import { Button } from "@heroui/react";

interface SubmitButtonProps {
    selectedStart: {lat: number, lng: number} | null;
    selectedEnd: {lat: number, lng: number} | null;
    setRouteStart: (routeStart: {lat: number, lng: number}) => void;
    setRouteEnd: (routeEnd: {lat: number, lng: number}) => void;
}

export default function SubmitButton({ selectedStart, selectedEnd, setRouteStart, setRouteEnd }: SubmitButtonProps) {
    return <Button onPress={() => {
        if (selectedStart && selectedEnd) {
            setRouteStart({lat: selectedStart.lat, lng: selectedStart.lng});
            setRouteEnd({lat: selectedEnd.lat, lng: selectedEnd.lng});
        }
    }}>Submit</Button>
}