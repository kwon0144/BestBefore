// Data source: https://open.toronto.ca/dataset/street-tree-data/

type RawFoodBank = [string, number, number];

type FoodBank = {
    key: string;
    name: string;
    lat: number;
    lng: number;
};

const foodBanks: RawFoodBank[] = [
    ["Food Bank 1", -37.806427, 144.986299],
    ["Food Bank 2", -37.811648, 145.000307],
    ["Food Bank 3", -37.798877, 144.956177],
    ["Food Bank 4", -37.801611, 144.981835],
    ["Food Bank 5", -37.805286, 144.977265],
];

const formatted: FoodBank[] = foodBanks.map(([name, lat, lng]) => ({
    name,
    lat,
    lng,
    key: JSON.stringify({ name, lat, lng }),
}));

export default formatted;