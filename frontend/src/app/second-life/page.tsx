"use client"

import { useState, useEffect } from "react";
import Title from "../(components)/Title"
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faArrowRight, faSpa, faBroom, faSeedling, faPalette, faPaw, faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { config } from "@/config";

// Interface for items from the diy_projects database
interface SecondLifeItem {
    id: number;
    items: string;
    type: string;
    method: string;
    label: string;
    description: string;
    picture: string;
    inside_picture: string;
}

export default function SecondLife() {
    // State management for search, filters, and data
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedFoodType, setSelectedFoodType] = useState<string | null>(null);
    const [items, setItems] = useState<SecondLifeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SecondLifeItem | null>(null);

    // Predefined food types for quick search
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

    // Category options with their respective icons
    const categories = [
        { name: 'Beauty & Personal Care', icon: faSpa },
        { name: 'Home Cleaning', icon: faBroom },
        { name: 'Garden & Compost', icon: faSeedling },
        { name: 'Natural Dyes', icon: faPalette },
        { name: 'Pet Care', icon: faPaw }
    ];

    // Fetch items when search query changes
    useEffect(() => {
        fetchItems();
    }, [searchQuery]);

    // Fetch items from the backend API
    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get<SecondLifeItem[]>(`${config.apiUrl}/api/second-life/`, {
                params: {
                    search: searchQuery
                }
            });
            setItems(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch items');
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
        }
    };

    // Event handlers for search and filters
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setSelectedFoodType(null);
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
        setSearchQuery(foodType);
    };

    const handleCardClick = (item: SecondLifeItem) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    // Filter items based on selected category
    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === null ||
            item.label === selectedCategory;
        return matchesCategory;
    });

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
                    {foodTypes.map((foodType) => (
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
                        className="py-2 px-4 rounded-full whitespace-nowrap !rounded-button cursor-pointer bg-[#f0f7f0] text-[#2c5e2e] hover:bg-[#e1efe1] border border-[#2c5e2e] shadow-sm transition-colors flex items-center gap-2"
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
                            <FontAwesomeIcon icon={category.icon} className="mr-2" />
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
                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : error ? (
                    <div className="text-center text-red-500">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleCardClick(item)}
                                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={item.picture}
                                        alt={item.items}
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>
                                <div className="p-5">
                                    <h3 className="text-xl font-semibold text-[#2c5e2e] mb-2">{item.method}</h3>
                                    <p className="text-gray-600 mb-4">{item.items}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-xs py-1 px-3 bg-[#f0f7f0] text-[#2c5e2e] rounded-full">
                                            {item.label}
                                        </span>
                                        <span className="text-xs py-1 px-3 bg-[#f0f7f0] text-[#2c5e2e] rounded-full">
                                            {item.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <Modal 
                isOpen={isModalOpen}
                onClose={closeModal}
                size="2xl"
                hideCloseButton
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-[#2c5e2e]">
                                {selectedItem?.method}
                            </h2>
                            <Button
                                isIconOnly
                                onPress={closeModal}
                                className="bg-transparent hover:bg-gray-100 rounded-full p-2"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
                            </Button>
                        </div>
                    </ModalHeader>
                    <ModalBody className="p-6">
                        {selectedItem && (
                            <>
                                <div className="mb-6">
                                    <img
                                        src={selectedItem.inside_picture}
                                        alt={`${selectedItem.method} process`}
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-[#f0f7f0] text-[#2c5e2e] rounded-full text-sm">
                                            {selectedItem.label}
                                        </span>
                                        <span className="px-3 py-1 bg-[#f0f7f0] text-[#2c5e2e] rounded-full text-sm">
                                            {selectedItem.type}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-700 mb-2">Description</h3>
                                        <p className="text-gray-600 whitespace-pre-line">
                                            {selectedItem.description}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
}