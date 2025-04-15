"use client"

import { useState } from "react";
import Title from "../(components)/Title"
import { Button, Input } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faArrowRight, faSpa, faBroom, faSeedling, faPalette, faPaw } from "@fortawesome/free-solid-svg-icons";

export default function SecondLife() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedFoodType, setSelectedFoodType] = useState<string | null>(null);
    const foodTypes = [
    'Coffee Grounds',
    'Fruit Peels',
    'Vegetable Scraps',
    'Eggshells',
    'Bread Crusts',
    'Avocado Pits',
    'Citrus Rinds',
    'Banana Peels'
    ];
    const categories = [
    { name: 'Beauty & Personal Care', icon: faSpa },
    { name: 'Home Cleaning', icon: faBroom },
    { name: 'Garden & Compost', icon: faSeedling },
    { name: 'Natural Dyes', icon: faPalette },
    { name: 'Pet Care', icon: faPaw }
    ];
    const foodItems = [
    {
    id: 1,
    name: 'Coffee Grounds',
    possibleUses: 8,
    categories: ['Beauty & Personal Care', 'Garden & Compost'],
    image: 'https://readdy.ai/api/search-image?query=Close%20up%20of%20used%20coffee%20grounds%20in%20a%20wooden%20bowl%20with%20a%20wooden%20spoon%2C%20on%20a%20neutral%20background%20with%20some%20coffee%20beans%20scattered%20around%2C%20soft%20natural%20lighting%2C%20minimalist%20aesthetic%2C%20high%20quality%20food%20photography&width=400&height=300&seq=1&orientation=landscape'
    },
    {
    id: 2,
    name: 'Citrus Peels',
    possibleUses: 6,
    categories: ['Home Cleaning', 'Natural Dyes'],
    image: 'https://readdy.ai/api/search-image?query=Sliced%20orange%20halves%20on%20a%20white%20marble%20surface%2C%20bright%20and%20vibrant%20orange%20color%2C%20clean%20minimalist%20food%20photography%2C%20soft%20natural%20lighting%2C%20high%20resolution%2C%20no%20props%2C%20simple%20elegant%20composition&width=400&height=300&seq=2&orientation=landscape'
    },
    {
    id: 3,
    name: 'Avocado Pits',
    possibleUses: 4,
    categories: ['Natural Dyes', 'Beauty & Personal Care'],
    image: 'https://readdy.ai/api/search-image?query=Fresh%20cut%20avocados%20on%20a%20wooden%20cutting%20board%2C%20showing%20the%20pits%20and%20flesh%2C%20natural%20lighting%2C%20top-down%20view%2C%20clean%20minimal%20composition%2C%20high%20quality%20food%20photography%2C%20neutral%20background%2C%20professional%20styling&width=400&height=300&seq=3&orientation=landscape'
    },
    {
    id: 4,
    name: 'Eggshells',
    possibleUses: 5,
    categories: ['Garden & Compost', 'Home Cleaning'],
    image: 'https://readdy.ai/api/search-image?query=A%20bowl%20of%20clean%20white%20eggshells%20on%20a%20neutral%20background%2C%20soft%20natural%20lighting%2C%20minimalist%20composition%2C%20high%20quality%20food%20photography%2C%20simple%20elegant%20styling%2C%20no%20props%2C%20focus%20on%20texture%20and%20detail&width=400&height=300&seq=4&orientation=landscape'
    },
    {
    id: 5,
    name: 'Banana Peels',
    possibleUses: 7,
    categories: ['Garden & Compost', 'Beauty & Personal Care'],
    image: 'https://readdy.ai/api/search-image?query=Fresh%20yellow%20banana%20peels%20arranged%20on%20a%20neutral%20stone%20background%2C%20clean%20minimalist%20food%20photography%2C%20soft%20natural%20lighting%2C%20high%20resolution%2C%20simple%20elegant%20composition%2C%20focus%20on%20texture%20and%20curves&width=400&height=300&seq=5&orientation=landscape'
    },
    {
    id: 6,
    name: 'Vegetable Scraps',
    possibleUses: 3,
    categories: ['Garden & Compost', 'Home Cleaning'],
    image: 'https://readdy.ai/api/search-image?query=Colorful%20vegetable%20scraps%20and%20peels%20neatly%20arranged%20on%20a%20wooden%20cutting%20board%2C%20including%20carrots%2C%20onions%2C%20and%20leafy%20greens%2C%20natural%20lighting%2C%20top-down%20view%2C%20clean%20minimal%20composition%2C%20high%20quality%20food%20photography&width=400&height=300&seq=6&orientation=landscape'
    }
    ];
    const filteredItems = foodItems.filter(item => {
    // Filter by search query
    const matchesSearch = searchQuery === '' ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase());
    // Filter by selected food type
    const matchesFoodType = selectedFoodType === null ||
    item.name === selectedFoodType;
    // Filter by selected category
    const matchesCategory = selectedCategory === null ||
    item.categories.includes(selectedCategory);
    return matchesSearch && matchesFoodType && matchesCategory;
    });
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    };
    const handleCategorySelect = (category: string) => {
    setSelectedCategory(prevCategory =>
    prevCategory === category ? null : category
    );
    };
    const handleFoodTypeSelect = (foodType: string) => {
    setSelectedFoodType(prevType =>
    prevType === foodType ? null : foodType
    );
    };
    return (

        <div className="min-h-screen max-w-7xl mx-auto py-20 px-10">
            {/* Title */}
            <Title heading="Second Life" description="Give your food scraps a new purpose. Discover creative ways to repurpose food waste
into useful products for your home, garden, and beauty routine." />
            {/* Search Bar */}
            <div className="mt-8 max-w-xl mx-auto">
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Search food items to repurpose..."
                        classNames={{
                            inputWrapper: "w-full py-3 px-4 pr-10 border-none bg-white border-1 shadow-md"
                        }}
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </div>
                </div>
            </div>
            {/* Quick Access Food Categories */}
            <div className="mt-8 overflow-x-auto pb-2">
                <div className="flex space-x-3 min-w-max px-2">
                    {[...foodTypes].map((foodType) => (
                        <Button
                            key={foodType}
                            onPress={() => handleFoodTypeSelect(foodType)}
                            className={`py-2 px-4 rounded-full whitespace-nowrap !rounded-button cursor-pointer ${
                            selectedFoodType === foodType
                            ? 'bg-[#2c5e2e] text-white'
                            : 'bg-white text-[#2c5e2e] hover:bg-gray-100'
                            } shadow-sm transition-colors`}
                            >
                            {foodType}
                        </Button>
                    ))}
                    <Button
                        className="py-2 px-4 rounded-full whitespace-nowrap !rounded-button cursor-pointer bg-[#f0f7f0] text-[#2c5e2e] hover:bg-[#e1efe1] border border-[#2c5e2e] shadow-sm transition-colors flex items-center"
                        >
                        See more
                        <FontAwesomeIcon icon={faArrowRight} />
                    </Button>
                </div>
            </div>
            {/* Filter Section */}
            <div className="mt-10">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Filter by category:</h3>
                <div className="flex flex-wrap gap-3">
                    {categories.map((category) => (
                    <Button
                        key={category.name}
                        onPress={() => handleCategorySelect(category.name)}
                        className={`flex items-center py-2 px-4 rounded-lg !rounded-button whitespace-nowrap cursor-pointer ${
                        selectedCategory === category.name
                            ? 'bg-[#2c5e2e] text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        } shadow-sm transition-colors`}
                        >
                        <FontAwesomeIcon icon={category.icon} />
                        <span>{category.name}</span>
                    </Button>
                    ))}
                </div>
            </div>
            {/* Results Grid */}
            <div className="mt-10">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                    {filteredItems.length} items found
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            <div className="h-48 overflow-hidden">
                                <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover object-top"
                                />
                            </div>
                            <div className="p-5">
                                <h3 className="text-xl font-semibold text-[#2c5e2e] mb-2">{item.name}</h3>
                                <p className="text-gray-600 mb-4">{item.possibleUses} possible uses</p>
                                <div className="flex flex-wrap gap-2">
                                    {item.categories.map((category) => (
                                    <span
                                        key={`${item.id}-${category}`}
                                        className="text-xs py-1 px-3 bg-[#f0f7f0] text-[#2c5e2e] rounded-full"
                                        >
                                        {category}
                                    </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div> 
    )
}