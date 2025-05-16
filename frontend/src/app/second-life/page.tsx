"use client"

import { useState, useEffect, useMemo, useRef } from "react";
import Title from "../(components)/Title"
import { faPaintBrush, faUtensils, faSpa, faHome, faBowlFood, faKitMedical } from "@fortawesome/free-solid-svg-icons";
import { config } from "@/config";
import { SecondLifeItem } from "@/interfaces/SecondLifeItem";
import ComingUp from "../(components)/ComingUp";
import { useSecondLifeItems } from "@/hooks/useSecondLifeItems";

// Component imports
import Search from "./Search";
import Ingredients from "./Ingredients";
import Categories from "./Categories";
import ItemsGrid from "./ItemsGrid";
import ItemDetail from "./ItemDetail";

export default function SecondLife() {
    // State management for search, filters, and data
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
    const [items, setItems] = useState<SecondLifeItem[]>([]);
    const [filteredItemsCount, setFilteredItemsCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SecondLifeItem | null>(null);
    const [inputValue, setInputValue] = useState('');
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Use the custom hook to fetch items
    const {
        items: allItems,
        loading,
        error,
        totalPages,
        fetchItems
    } = useSecondLifeItems({
        itemsPerPage,
        initialSearchQuery: searchQuery,
        initialIngredient: selectedIngredient || ''
    });

    // Featured items for first page
    const featuredItemIds = useMemo(() => [33, 17, 29, 30, 20, 31], []);
    const itemsGridRef = useRef<HTMLDivElement>(null);

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

    // Update displayed items after fetch
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
                // Set the total count to allItems.length instead of featured.length
                setFilteredItemsCount(allItems.length);
                return;
            }
        }

        // Apply all filters
        let filteredItems = allItems;
        
        // Filter by category if selected
        if (selectedCategory) {
            filteredItems = filteredItems.filter(item => item.method_category === selectedCategory);
        }

        // Update filtered items count
        setFilteredItemsCount(filteredItems.length);

        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setItems(filteredItems.slice(startIndex, endIndex));
    }, [currentPage, allItems, featuredItemIds, searchQuery, selectedCategory, selectedIngredient, itemsPerPage]);

    // Event handlers
    const handleCategorySelect = (category: string) => {
        setSelectedCategory(prevCategory =>
            prevCategory === category ? null : category
        );
        // Reset to first page when changing category
        setCurrentPage(1);
        // Scroll to items grid
        if (itemsGridRef.current) {
            const offset = 80;
            const elementPosition = itemsGridRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const handleIngredientSelect = (ingredient: string | null) => {
        setSelectedIngredient(prev => prev === ingredient ? null : ingredient);
        setSearchQuery('');
        setInputValue('');
        setCurrentPage(1);
        
        // Use the hook's fetchItems method
        fetchItems('', ingredient || '');
    };

    // Update search query and fetch items
    useEffect(() => {
        fetchItems(searchQuery, selectedIngredient || '');
    }, [searchQuery, fetchItems]);

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
        // Scroll to items grid section with offset
        if (itemsGridRef.current) {
            const offset = 80;
            const elementPosition = itemsGridRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div>
            {/* Title */}
            <div className="py-12">
                <Title heading="Second Life" 
                description="Give your food scraps a new purpose. Discover creative ways to repurpose food waste into useful products for your home, garden, and beauty routine." 
                background="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/secondlife-titlebg.jpeg"
                />
            </div>
            
            {/* Search Component */}
            <div className="min-h-screen max-w-7xl mx-auto px-10 mt-8 mb-20">
                {/* Search Component */}
                <Search 
                    setSearchQuery={setSearchQuery} 
                    setSelectedIngredient={setSelectedIngredient}
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                />

                {/* Ingredients Component */}
                <Ingredients 
                    ingredients={ingredients}
                    selectedIngredient={selectedIngredient}
                    handleIngredientSelect={handleIngredientSelect}
                />

                {/* Categories Component */}
                <Categories 
                    categories={categories}
                    selectedCategory={selectedCategory}
                    handleCategorySelect={handleCategorySelect}
                />

                {/* ItemsGrid Component */}
                <ItemsGrid 
                    ref={itemsGridRef}
                    items={items}
                    allItems={allItems}
                    filteredItemsCount={filteredItemsCount}
                    loading={loading}
                    error={error}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handleCardClick={handleCardClick}
                    handlePageChange={handlePageChange}
                />

                {/* ItemDetail Component */}
                <ItemDetail 
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    item={selectedItem}
                />
                
                {/* Coming up next section */}
                <ComingUp
                    message="From Your Kitchen to the Community!"
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