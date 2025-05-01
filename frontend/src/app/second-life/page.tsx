"use client"

import { useState, useEffect, useCallback } from "react";
import Title from "../(components)/Title"
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, Pagination } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faArrowRight, faSpa, faTimes, faPaintBrush, faUtensils, faHome, faBowlFood, faKitMedical, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { config } from "@/config";

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
    const [allItems, setAllItems] = useState<SecondLifeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SecondLifeItem | null>(null);
    const [showAllIngredients, setShowAllIngredients] = useState(false);
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [totalPages, setTotalPages] = useState(1);

    // Featured items for first page
    const featuredItemIds = [33, 17, 29, 30, 20, 31];

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

    // Number of ingredients to show initially
    const initialDisplayCount = 6;
    const displayedIngredients = showAllIngredients 
        ? ingredients 
        : ingredients.slice(0, initialDisplayCount);

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
                    search: searchQuery || selectedIngredient
                }
            });
            setAllItems(response.data);
            setTotalPages(Math.ceil(response.data.length / itemsPerPage));
            setError(null);
        } catch (err) {
            setError('Failed to fetch items');
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedIngredient]);

    // Update displayed items when page changes or filter changes
    useEffect(() => {
        if (allItems.length === 0) return;

        // For the first page with no search/filter, show featured items
        if (currentPage === 1 && !searchQuery && !selectedIngredient && !selectedCategory) {
            // Get featured items if they exist
            const featured = allItems.filter(item => featuredItemIds.includes(item.method_id));
            // If we have all featured items, display them
            if (featured.length === featuredItemIds.length) {
                // Sort them according to the order in featuredItemIds
                const sortedFeatured = featuredItemIds.map(id => 
                    featured.find(item => item.method_id === id)
                ).filter(item => item !== undefined) as SecondLifeItem[];
                setItems(sortedFeatured);
                return;
            }
        }

        // Filter by category first
        let filteredItems = allItems;
        if (selectedCategory) {
            filteredItems = filteredItems.filter(item => item.method_category === selectedCategory);
        }

        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setItems(filteredItems.slice(startIndex, endIndex));
        setTotalPages(Math.ceil(filteredItems.length / itemsPerPage));
    }, [currentPage, allItems, selectedCategory, searchQuery, selectedIngredient]);

    // Fetch items when search query changes
    useEffect(() => {
        fetchItems();
        // Reset to first page when search or filters change
        setCurrentPage(1);
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
        // Reset to first page when changing category
        setCurrentPage(1);
    };

    const handleIngredientSelect = (ingredient: string) => {
        setSelectedIngredient(prevIngredient =>
            prevIngredient === ingredient ? null : ingredient
        );
        // Instead of setting searchQuery, we use selectedIngredient in the fetchItems function
        setSearchQuery('');
        // Reset to first page when selecting an ingredient
        setCurrentPage(1);
        
        // Trigger search immediately
        fetchItems();
    };

    const handleCardClick = (item: SecondLifeItem) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top when changing page
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

            {/* Quick Access Ingredients */}
            <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Common food scraps:</h3>
                <div className="flex flex-wrap gap-3">
                    {displayedIngredients.map((ingredient) => (
                        <div
                            key={ingredient}
                            onClick={() => handleIngredientSelect(ingredient)}
                            className="bg-white px-4 py-2 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition"
                        >
                            {ingredient}
                        </div>
                    ))}
                </div>
                
                {ingredients.length > initialDisplayCount && (
                    <Button
                        variant="light"
                        size="sm"
                        className="mt-4 text-[#2c5e2e]"
                        onPress={() => setShowAllIngredients(!showAllIngredients)}
                    >
                        {showAllIngredients 
                            ? <>Show Less <FontAwesomeIcon icon={faChevronUp} className="ml-1" /></>
                            : <>See More <FontAwesomeIcon icon={faChevronDown} className="ml-1" /></>
                        }
                    </Button>
                )}
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

            {/* Results Grid */}
            <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                    {allItems.length} items found
                </h3>
                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : error ? (
                    <div className="text-center text-red-500">{error}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((item) => (
                                <div
                                    key={item.method_id}
                                    onClick={() => handleCardClick(item)}
                                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                >
                                    <div className="h-48 overflow-hidden">
                                        {item.picture ? (
                                            <img
                                                src={item.picture}
                                                alt={item.method_name}
                                                className="w-full h-full object-cover object-top"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <span className="text-gray-400">No image available</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-xl font-semibold text-[#2c5e2e] mb-2">{item.method_name}</h3>
                                        <p className="text-gray-600 mb-4">{item.ingredient}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-xs py-1 px-3 bg-[#f0f7f0] text-[#2c5e2e] rounded-full">
                                                {item.method_category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-10">
                                <Pagination
                                    total={totalPages}
                                    initialPage={currentPage}
                                    onChange={handlePageChange}
                                    variant="light"
                                    classNames={{
                                        cursor: "bg-[#2c5e2e]",
                                        item: "text-[#2c5e2e]",
                                    }}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                size="2xl"
                hideCloseButton
                classNames={{
                    base: "max-w-3xl mx-auto",
                    body: "p-0 overflow-hidden"
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
                            <div className="flex flex-col h-full">
                                {/* Fixed content */}
                                <div className="px-6">
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
                                    
                                    <div className="flex gap-2 mb-4">
                                        <span className="px-3 py-1 bg-[#f0f7f0] text-[#2c5e2e] rounded-full text-sm">
                                            {selectedItem.method_category}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Scrollable content */}
                                <div className="px-6 overflow-y-auto" style={{ maxHeight: "calc(70vh - 350px)" }}>
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
                            </div>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
}