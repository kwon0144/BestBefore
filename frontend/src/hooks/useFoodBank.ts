import { useState, useEffect } from "react";
import { Foodbank, FoodbankResponse } from "@/interfaces/Foodbank";

export function useFoodBanks(): {
    foodbanks: Foodbank[];
    loading: boolean;
    error: string | null;
} {
    const [foodbanks, setFoodbanks] = useState<Foodbank[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFoodbanks = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${backendUrl}/api/foodbanks/`);
                if (!response.ok) {
                    throw new Error('Failed to fetch foodbanks');
                }
                const responseData: FoodbankResponse = await response.json();
                setFoodbanks(responseData.data);
            } catch (error) {
                setError(`Error fetching foodbanks: ${error}`);

            } finally {
                setLoading(false);
            }
        };

        fetchFoodbanks();
    }, []);

    return { foodbanks, loading, error };
}

export function useFoodBankById(selectedEnd: string | null): {
    foodbank: Foodbank | null;
    loading: boolean;
    error: string | null
} {
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
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${backendUrl}/api/foodbanks/`);
                if (!response.ok) {
                    throw new Error('Failed to fetch foodbank data');
                }
                const responseData: FoodbankResponse = await response.json();

                // Find the foodbank with matching ID
                const selectedFoodbank = responseData.data.find(
                    (bank: Foodbank) => bank.id === parseInt(selectedEnd)
                );
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

// export function useFoodBankNameById(selectedEnd: string | null): string {
//     const [selectedFoodBank, setSelectedFoodBank] = useState<Foodbank | null>(null);
//     const [foodBanks, setFoodBanks] = useState<Foodbank[]>([]);

//     useEffect(() => {
//         const fetchFoodBanks = async () => {
//             try {
//                 const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
//                 const response = await fetch(`${backendUrl}/api/foodbanks/`);
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch foodbanks');
//                 }
//                 const responseData: FoodbankResponse = await response.json();
//                 setFoodBanks(responseData.data);
//             } catch (error) {
//                 console.error('Error fetching foodbanks:', error);
//             }
//         };

//         fetchFoodBanks();
//     }, []);

//     useEffect(() => {
//         if (foodBanks.length > 0) {
//             setSelectedFoodBank(
//                 foodBanks.find((bank: Foodbank) => bank.id === parseInt(selectedEnd || "1")) || null
//             );
//         }
//     }, [selectedEnd, foodBanks]);

//     return selectedFoodBank?.name || "Not Found";
// }