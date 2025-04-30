"use client"

import { useState, useEffect, useCallback } from "react";
import Title from "../(components)/Title"
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faArrowRight, faSpa, faTimes, faPaintBrush, faUtensils, faHome, faBowlFood, faKitMedical } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { config } from "@/config";
import ComingUp from "../(components)/ComingUp";

// Interface for items from the diy_projects database
interface SecondLifeItem {
    method_id: number;
    method_name: string;
    is_combo: boolean;
    method_category: string;
    ingredient: string;
    description: string;
    picture: string;
}

export default function SecondLife() {
    // State management for search, filters, and data
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
    const [items, setItems] = useState<SecondLifeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SecondLifeItem | null>(null);

    // Predefined ingredients for quick search
    const ingredients = [
        'apple',
        'potato',
        'banana',
        'lemon',
        'orange',
        'grapefruit',
        'onion',
        'celery',
        'carrot',
        'mushroom',
        'tomato',
        'avocado',
        'cucumber',
        'citrus',
        'sour milk'
    ];

    // Category options with icons
    const categories = [
        { name: 'craft', icon: faPaintBrush },
        { name: 'food', icon: faUtensils },
        { name: 'beauty', icon: faSpa },
        { name: 'household', icon: faHome },
        { name: 'cooking', icon: faBowlFood },
        { name: 'first aid', icon: faKitMedical }
    ];

    // Fetch items from the backend API
    const fetchItems = useCallback(async () => {
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
    }, [searchQuery]);

    // Fetch items when search query changes
    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Event handlers for search and filters
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setSelectedIngredient(null);
    };

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(prevCategory =>
            prevCategory === category ? null : category
        );
    };

    const handleIngredientSelect = (ingredient: string) => {
        setSelectedIngredient(prevIngredient =>
            prevIngredient === ingredient ? null : ingredient
        );
        setSearchQuery(ingredient);
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
            item.method_category === selectedCategory;
        return matchesCategory;
    });

    return (
        <div>
            {/* Title */}
            <div className="py-12">
                <Title heading="Second Life" 
                description="Give your food scraps a new purpose. Discover creative ways to repurpose food waste into useful products for your home, garden, and beauty routine." 
                background="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/secondlife-titlebg.jpeg"
                />
            </div>
            {/* Search Bar */}
            <div className="min-h-screen max-w-7xl mx-auto px-10">
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

                {/* Quick Access Ingredients */}
                <div className="mt-6 overflow-x-auto">
                    <div className="flex space-x-3 min-w-max px-2">
                        {ingredients.map((ingredient) => (
                            <Button
                                key={ingredient}
                                onPress={() => handleIngredientSelect(ingredient)}
                                className={`py-2 px-4 rounded-full whitespace-nowrap !rounded-button cursor-pointer ${
                                    selectedIngredient === ingredient
                                    ? 'bg-[#2c5e2e] text-white'
                                    : 'bg-white text-[#2c5e2e] hover:bg-gray-100'
                                } shadow-sm transition-colors`}
                            >
                                {ingredient}
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
                <div className="mt-8">
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
            {/* Detail Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                size="2xl"
                hideCloseButton
                classNames={{
                    base: "max-w-3xl mx-auto",
                    body: "min-h-[70vh] max-h-[70vh] overflow-y-auto"
                }}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-[#2c5e2e]">
                                {selectedItem?.method_name}
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
                    <ModalBody>
                        {selectedItem && (
                            <>
                                <div className="mb-6">
                                    {selectedItem?.picture ? (
                                        <img
                                            src={selectedItem.picture}
                                            alt={`${selectedItem.method_name} process`}
                                            className="w-full h-64 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                                            <span className="text-gray-400">No image available</span>
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
                                    {selectedItem?.method_name}
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
                        <ModalBody>
                            {selectedItem && (
                                <>
                                    <div className="mb-6">
                                        {selectedItem?.picture ? (
                                            <img
                                                src={selectedItem.picture}
                                                alt={`${selectedItem.method_name} process`}
                                                className="w-full h-64 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                                                <span className="text-gray-400">No image available</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-[#f0f7f0] text-[#2c5e2e] rounded-full text-sm">
                                                {selectedItem.method_category}
                                            </span>
                                        </div>
                                        
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-700 mb-2">Description</h3>
                                            {selectedItem.description
                                                .split('.')
                                                .filter(line => line.trim() !== '')
                                                .map((line, idx) => (
                                                    <div key={idx} className="text-gray-600 whitespace-pre-line mt-2">
                                                        {line.trim() + '.'}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </ModalBody>
                    </ModalContent>
                </Modal>
                {/* Coming up next section */}
                <ComingUp
                    message="Step Out of Your Kitchen to the Community!"
                    title="Discover how you can support your community"
                    description="Donating surplus food or disposing of waste responsibly — every small action makes a big impact."
                    buttonText="Explore the Food Network"
                    buttonLink="/food-network"
                    imageSrc="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/second-life-next.png"
                    imageAlt="Food Network"
                />
            </div>
        </div>
    );
}