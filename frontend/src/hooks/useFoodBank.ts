import { useState, useEffect } from "react";
import foodBanks, { FoodBank } from "@/data/foodBanks";
import { Foodbank } from "@/app/api/foodbanks/route";

export function useFoodBank(selectedEnd: { lat: number, lng: number } | null) {
    const [foodbank, setFoodbank] = useState<Foodbank | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFoodbank = async () => {
            if (!selectedEnd) {
                setFoodbank(null);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/foodbanks');
                if (!response.ok) {
                    throw new Error('Failed to fetch foodbank data');
                }
                const data = await response.json();

                // Find the foodbank closest to the selected coordinates
                const closestFoodbank = data.data.reduce((closest: Foodbank | null, current: Foodbank) => {
                    if (!closest) return current;

                    const closestDist = Math.sqrt(
                        Math.pow(closest.latitude - selectedEnd.lat, 2) +
                        Math.pow(closest.longitude - selectedEnd.lng, 2)
                    );
                    const currentDist = Math.sqrt(
                        Math.pow(current.latitude - selectedEnd.lat, 2) +
                        Math.pow(current.longitude - selectedEnd.lng, 2)
                    );

                    return currentDist < closestDist ? current : closest;
                }, null);

                setFoodbank(closestFoodbank);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchFoodbank();
    }, [selectedEnd]);

    return { foodbank, loading, error };
}

export function useFoodBankName(selectedEnd: string | null) {
    const [selectedFoodBank, setSelectedFoodBank] = useState<FoodBank | null>(null);

    useEffect(() => {
        setSelectedFoodBank(foodBanks.find(
            bank => bank.key === selectedEnd
        ) || null);
    }, [selectedEnd]);

    return selectedFoodBank?.name || "Not Found";
}