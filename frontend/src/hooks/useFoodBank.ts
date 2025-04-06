import { useState, useEffect } from "react";
import foodBanks, { FoodBank } from "@/data/foodBanks";

export function useFoodBank(selectedEnd: { lat: number, lng: number } | null) {
    // TODO: Implement this
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