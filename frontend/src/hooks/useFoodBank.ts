import { useState, useEffect } from "react";
import { Foodbank } from "@/app/api/foodbanks/route";

export function useFoodBank(selectedEnd: string | null) {
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

                // Find the foodbank with matching ID
                const selectedFoodbank = data.data.find((bank: Foodbank) => bank.id === parseInt(selectedEnd));
                setFoodbank(selectedFoodbank || null);
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
    const [selectedFoodBank, setSelectedFoodBank] = useState<Foodbank | null>(null);
    const [foodBanks, setFoodBanks] = useState<Foodbank[]>([]);

    useEffect(() => {
        const fetchFoodBanks = async () => {
            try {
                const response = await fetch('/api/foodbanks');
                if (!response.ok) {
                    throw new Error('Failed to fetch foodbanks');
                }
                const data = await response.json();
                setFoodBanks(data.data);
            } catch (error) {
                console.error('Error fetching foodbanks:', error);
            }
        };

        fetchFoodBanks();
    }, []);

    useEffect(() => {
        if (foodBanks.length > 0) {
            setSelectedFoodBank(
                foodBanks.find((bank: Foodbank) => bank.id === parseInt(selectedEnd || "1")) || null
            );
        }
    }, [selectedEnd, foodBanks]);

    return selectedFoodBank?.name || "Not Found";
}