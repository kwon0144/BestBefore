"use client"

import { useState } from "react";
import Title from "../(components)/Title"
import { Button, Input } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf, faMinus, faPlus, faTimes, faSearch } from "@fortawesome/free-solid-svg-icons";

export default function EcoGrocery() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMeals, setSelectedMeals] = useState<Array<{id: number; name: string; quantity: number}>>([]);
    const popularMeals = [
    'Grilled Chicken',
    'Beef Steak',
    'Salmon Fillet',
    'Pork Chops',
    'Turkey Breast',
    'Lamb Chops',
    'Tuna Steak',
    'Duck Breast'
    ];
    const mealChoices = [
    {
    id: 1,
    name: 'Vegetarian Buddha Bowl',
    description: 'Colorful bowl with quinoa, roasted vegetables, and tahini dressing.',
    imageUrl: 'https://readdy.ai/api/search-image?query=A%20vibrant%20buddha%20bowl%20filled%20with%20colorful%20roasted%20vegetables%2C%20quinoa%2C%20avocado%2C%20and%20drizzled%20with%20tahini%20sauce%2C%20served%20on%20a%20white%20plate%20against%20a%20minimal%20light%20background%2C%20professional%20food%20photography%20with%20natural%20lighting&width=300&height=200&seq=1&orientation=landscape'
    },
    {
    id: 2,
    name: 'Kung Pao Chicken',
    description: 'Spicy Chinese stir-fry with peanuts and vegetables.',
    imageUrl: 'https://readdy.ai/api/search-image?query=A%20traditional%20Chinese%20Kung%20Pao%20chicken%20dish%20with%20diced%20chicken%2C%20peanuts%2C%20dried%20chilies%2C%20and%20scallions%20in%20a%20glossy%20sauce%2C%20served%20on%20a%20white%20plate%20against%20a%20minimal%20light%20background%2C%20professional%20food%20photography%20with%20dramatic%20lighting&width=300&height=200&seq=2&orientation=landscape'
    },
    {
    id: 3,
    name: 'Fettuccine Alfredo',
    description: 'Creamy Italian pasta with parmesan cheese.',
    imageUrl: 'https://readdy.ai/api/search-image?query=A%20luxurious%20plate%20of%20fettuccine%20alfredo%20pasta%20in%20creamy%20white%20sauce%2C%20garnished%20with%20fresh%20parsley%20and%20black%20pepper%2C%20served%20on%20a%20white%20plate%20against%20a%20minimal%20light%20background%2C%20professional%20food%20photography%20with%20soft%20natural%20lighting&width=300&height=200&seq=3&orientation=landscape'
    },
    {
    id: 4,
    name: 'Mediterranean Salad',
    description: 'Fresh salad with feta, olives, and grilled vegetables.',
    imageUrl: 'https://readdy.ai/api/search-image?query=A%20fresh%20Mediterranean%20salad%20with%20mixed%20greens%2C%20cherry%20tomatoes%2C%20cucumber%2C%20red%20onions%2C%20kalamata%20olives%2C%20and%20crumbled%20feta%20cheese%2C%20served%20on%20a%20white%20plate%20against%20a%20minimal%20light%20background%2C%20professional%20food%20photography%20with%20natural%20lighting&width=300&height=200&seq=4&orientation=landscape'
    }
    ];
    const pantryItems = [
    { name: 'Olive Oil', quantity: '500ml' },
    { name: 'Salt', quantity: '200g' },
    { name: 'Pepper', quantity: '100g' },
    { name: 'Garlic', quantity: '5 heads' },
    { name: 'Herbs', quantity: '3 packs' },
    { name: 'Butter', quantity: '250g' }
    ];
    const groceryItems = [
    { name: 'Chicken Breast', quantity: '500g', category: 'Meat' },
    { name: 'Beef Steak', quantity: '400g', category: 'Meat' },
    { name: 'Salmon', quantity: '300g', category: 'Fish' },
    { name: 'Pork Chops', quantity: '600g', category: 'Meat' },
    { name: 'Fresh Herbs', quantity: '2 packs', category: 'Produce' },
    { name: 'Lemons', quantity: '4 pieces', category: 'Produce' }
    ];
    const addMeal = (meal: {id: number; name: string}) => {
    const existingMeal = selectedMeals.find(m => m.id === meal.id);
    if (existingMeal) {
    setSelectedMeals(selectedMeals.map(m =>
    m.id === meal.id ? {...m, quantity: m.quantity + 1} : m
    ));
    } else {
    setSelectedMeals([...selectedMeals, {...meal, quantity: 1}]);
    }
    };
    const removeMeal = (id: number) => {
    setSelectedMeals(selectedMeals.filter(meal => meal.id !== id));
    };
    const adjustQuantity = (id: number, change: number) => {
    setSelectedMeals(selectedMeals.map(meal => {
    if (meal.id === id) {
    const newQuantity = Math.max(1, meal.quantity + change);
    return {...meal, quantity: newQuantity};
    }
    return meal;
    }));
    };
    return (
        <div className="min-h-screen max-w-7xl mx-auto py-20 px-10">
            {/* Title */}
            <Title heading="Eco Grocery" description="Create a precise shopping list to reduce food waste." />
            {/* Search Section */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-grow">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search food items to repurpose..."
                            classNames={{
                                inputWrapper: "w-full py-3 px-4 pr-10 border-none bg-white border-1 shadow-md"
                            }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <FontAwesomeIcon icon={faSearch} />
                        </div>
                    </div>
                </div>
                <Button className="bg-[#2F5233] text-white px-6 py-3 rounded-lg shadow-sm hover:bg-[#1B371F] transition cursor-pointer !rounded-button whitespace-nowrap">
                    Enter Your Preference
                </Button>
            </div>
            {/* Popular Meals */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Popular Meals</h2>
                <div className="flex overflow-x-auto pb-4 gap-4">
                    {popularMeals.map((meal, index) => (
                        <div
                            key={index}
                            className="bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer min-w-max !rounded-button whitespace-nowrap"
                            onClick={() => setSearchQuery(meal)}
                        >
                            {meal}
                        </div>
                    ))}
                </div>
            </div>
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Selected Meals and Grocery List */}
                <div className="lg:col-span-2 space-y-8">
                {/* Meal Choices */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Choices of Meals</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {mealChoices.map((meal) => (
                            <div key={meal.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="relative h-32 overflow-hidden">
                                    <img
                                    src={meal.imageUrl}
                                    alt={meal.name}
                                    className="w-full h-full object-cover object-top"
                                    />
                                    <Button
                                        className="absolute top-2 right-2 bg-[#2F5233] text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-[#1B371F] transition cursor-pointer !rounded-button whitespace-nowrap"
                                        onPress={() => addMeal({id: meal.id, name: meal.name})}
                                        >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </Button>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-sm">{meal.name}</h3>
                                    <p className="text-gray-600 text-xs mt-1">{meal.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Selected Meals */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Selected Meals</h2>
                    {selectedMeals.length === 0 ? (
                        <p className="text-gray-500 italic">No meals selected yet. Add meals from the choices above.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {selectedMeals.map((meal) => (
                                <li key={meal.id} className="py-3 flex justify-between items-center">
                                    <span className="font-medium">{meal.name}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center">
                                            <Button
                                                className="text-gray-500 hover:text-[#2F5233] w-6 h-6 flex items-center justify-center cursor-pointer !rounded-button whitespace-nowrap"
                                                onPress={() => adjustQuantity(meal.id, -1)}
                                                >
                                                <FontAwesomeIcon icon={faMinus} />
                                            </Button>
                                            <span className="mx-2 w-6 text-center">{meal.quantity}</span>
                                            <Button
                                                className="text-gray-500 hover:text-[#2F5233] w-6 h-6 flex items-center justify-center cursor-pointer !rounded-button whitespace-nowrap"
                                                onPress={() => adjustQuantity(meal.id, 1)}
                                                >
                                                <FontAwesomeIcon icon={faPlus} />
                                            </Button>
                                            </div>
                                            <Button
                                                className="text-red-500 hover:text-red-700 cursor-pointer !rounded-button whitespace-nowrap"
                                                onPress={() => removeMeal(meal.id)}
                                                >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {/* Smart Grocery List */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Smart Grocery List</h2>
                        {selectedMeals.length === 0 ? (
                            <p className="text-gray-500 italic mb-4">Select meals to generate your grocery list.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Items to Buy */}
                                <div>
                                    <h3 className="font-medium text-lg mb-3 text-[#2F5233]">Items to Buy</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-2">Meat & Fish</h4>
                                            <ul className="space-y-2">
                                                {groceryItems
                                                    .filter(item => item.category === 'Meat' || item.category === 'Fish')
                                                    .map((item, index) => (
                                                        <li key={index} className="flex justify-between items-center">
                                                            <span>{item.name}</span>
                                                            <span className="text-gray-600">{item.quantity}</span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-2">Produce</h4>
                                            <ul className="space-y-2">
                                                {groceryItems
                                                    .filter(item => item.category === 'Produce')
                                                    .map((item, index) => (
                                                        <li key={index} className="flex justify-between items-center">
                                                            <span>{item.name}</span>
                                                            <span className="text-gray-600">{item.quantity}</span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    </div>
                                    {/* Already in Pantry */}
                                    <div>
                                        <h3 className="font-medium text-lg mb-3 text-[#2F5233]">Already in Your Pantry</h3>
                                        <ul className="space-y-2">
                                        {pantryItems.map((item, index) => (
                                            <li key={index} className="flex justify-between items-center text-gray-500">
                                                <span>{item.name}</span>
                                                <span>{item.quantity}</span>
                                            </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            )}
                            <Button
                                className={`mt-8 w-full bg-[#2F5233] text-white py-3 rounded-lg shadow-sm hover:bg-[#1B371F] transition ${selectedMeals.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} !rounded-button whitespace-nowrap`}
                                disabled={selectedMeals.length === 0}
                                >
                                Generate Final Grocery List
                            </Button>
                            </div>
                        </div>
                        {/* Right Column - Food Inventory */}
                        <div>
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Food Inventory</h2>
                                <div className="space-y-6">
                                    <div>
                                    <h3 className="font-medium text-[#2F5233] mb-3">Refrigerator</h3>
                                    <ul className="space-y-2">
                                        <li className="flex justify-between items-center">
                                            <span>Chicken Breast</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">400g</span>
                                                <span className="text-sm text-orange-500">2 days left</span>
                                            </div>
                                        </li>
                                        <li className="flex justify-between items-center">
                                            <span>Salmon Fillet</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">200g</span>
                                                <span className="text-sm text-red-500">1 day left</span>
                                            </div>
                                        </li>
                                        <li className="flex justify-between items-center">
                                            <span>Fresh Vegetables</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">500g</span>
                                                <span className="text-sm text-green-500">4 days left</span>
                                            </div>
                                        </li>
                                        <li className="flex justify-between items-center">
                                            <span>Milk</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">1L</span>
                                                <span className="text-sm text-orange-500">3 days left</span>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-medium text-[#2F5233] mb-3">Pantry</h3>
                                    <ul className="space-y-2">
                                        <li className="flex justify-between items-center">
                                            <span>Rice</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">2kg</span>
                                                <span className="text-sm text-green-500">30 days left</span>
                                            </div>
                                        </li>
                                        <li className="flex justify-between items-center">
                                            <span>Pasta</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">500g</span>
                                                <span className="text-sm text-green-500">60 days left</span>
                                            </div>
                                        </li>
                                        <li className="flex justify-between items-center">
                                            <span>Canned Tomatoes</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">400g</span>
                                                <span className="text-sm text-green-500">90 days left</span>
                                            </div>
                                        </li>
                                        <li className="flex justify-between items-center">
                                            <span>Olive Oil</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">750ml</span>
                                                <span className="text-sm text-green-500">180 days left</span>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <Button className="mt-6 w-full bg-[#2F5233] text-white py-3 rounded-lg shadow-sm hover:bg-[#1B371F] transition cursor-pointer !rounded-button whitespace-nowrap">
                                Update Inventory
                            </Button>
                        </div>
                        <div className="bg-[#E6F2E6] rounded-lg p-6 mt-6">
                            <div className="flex items-start gap-4">
                                <div className="text-[#2F5233] mt-1">
                                    <FontAwesomeIcon icon={faLeaf} />
                                </div>
                            <div>
                                <h3 className="font-medium text-[#2F5233] mb-2">Eco-Friendly Tip</h3>
                                <p className="text-gray-700">Planning your meals and creating precise shopping lists can reduce food waste by up to 25%. Your smart choices help the planet!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}