// Data source: https://open.toronto.ca/dataset/street-tree-data/

type RawFoodBank = [string, string, number, number];

export type FoodBank = {
    key: string;
    name: string;
    lat: number;
    lng: number;
};

const foodBanks: RawFoodBank[] = [
    ["1", "Food Bank 1", -37.806427, 144.986299],
    ["2", "Food Bank 2", -37.811648, 145.000307],
    ["3", "Food Bank 3", -37.798877, 144.956177],
    ["4", "Food Bank 4", -37.801611, 144.981835],
    ["5", "Food Bank 5", -37.805286, 144.977265],
];

const formatted: FoodBank[] = foodBanks.map(([key, name, lat, lng]) => ({
    key,
    name,
    lat,
    lng,
}));

export default formatted;