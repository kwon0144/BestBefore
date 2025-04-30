/**
 * EcoGrocery Page Component
 * 
 * This component provides a comprehensive grocery planning interface that helps users:
 * - Search for meals by name or cuisine type
 * - Browse popular cuisine categories
 * - Select meals for their weekly plan
 * - Generate optimized grocery lists based on selected meals
 * - Identify items already available in their pantry/inventory
 * 
 * The component intelligently combines meal planning with inventory management
 * to reduce food waste by preventing duplicate purchases and suggesting recipes
 * based on available ingredients.
 */
"use client"

import { useState, useEffect, useRef } from "react";
import Title from "../(components)/Title"
import { useGroceryPlanner } from "@/hooks/useGroceryPlanner";
import { PantrySummary } from "../(components)/Inventory";
import { MealChoice as MealChoiceType, SignatureDish } from "./interfaces";
import axios from 'axios';
import { config } from '@/config';
import Search from "./Search";
import PopularMeal from "./PopularMeal";
import MealChoice from "./MealChoice";
import SelectedMeal from "./SelectedMeal";
import GroceryList from "./GroceryList";
import { addToast, ToastProvider } from "@heroui/react";
import ComingUp from "../(components)/ComingUp";

// Debug JSON Display Component
const JsonDebugDisplay = ({ data, title }: { data: unknown; title: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="mt-4 border border-gray-300 rounded-md overflow-hidden">
            <div 
                className="bg-gray-100 p-2 flex justify-between items-center cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="text-sm font-medium">{title}</h3>
                <span>{isOpen ? '[-]' : '[+]'}</span>
            </div>
            {isOpen && (
                <pre className="p-4 bg-gray-50 text-xs overflow-auto max-h-96">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

/**
 * EcoGrocery page component for meal planning and grocery list generation
 * 
 * @returns {JSX.Element} Rendered component with meal planning and grocery list interfaces
 */
export default function EcoGrocery() {
    const groceryListRef = useRef<HTMLDivElement>(null);
    const selectedMealRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
    const [signatureDishes, setSignatureDishes] = useState<SignatureDish[]>([]);
    const [isLoadingSignatureDishes, setIsLoadingSignatureDishes] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    
    // Use the grocery planner hook
    const {
        selectedMeals,
        groceryItems,
        pantryItems,
        loading,
        error,
        groceryList,
        addMeal,
        addCustomMeal,
        removeMeal,
        adjustQuantity,
        generateGroceryList,
        getGroceryItemsByCategory
    } = useGroceryPlanner();

    const popularMeals = [
        'Chinese Cuisine',
        'Italian Cuisine',
        'Thai Cuisine',
        'French Cuisine',
        'Indian Cuisine',
        'Mexican Cuisine',
        'Japanese Cuisine',
        'Korean Cuisine',
        'Beef Dishes',
        'Lamb Dishes',
        'Seafood',
        'Vegetarian',
        'Mediterranean'
    ];
    
    // Complete meal list with all options, including cuisine categorization
    const allMealChoices: (MealChoiceType & { cuisine?: string })[] = [
        {
            id: 1,
            name: 'Vegetarian Buddha Bowl',
            description: 'Colorful bowl with quinoa, roasted vegetables, and tahini dressing.',
            imageUrl: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/meal-img/49_Vegetarian+Buddha+Bowl.jpg',
            cuisine: 'Vegetarian'
        },
        {
            id: 2,
            name: 'Kung Pao Chicken',
            description: 'Spicy Chinese stir-fry with peanuts and vegetables.',
            imageUrl: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/meal-img/01_Kung+Pao+Chicken.jpg',
            cuisine: 'Chinese Cuisine'
        },
        {
            id: 3,
            name: 'Fettuccine Alfredo',
            description: 'Creamy Italian pasta with parmesan cheese.',
            imageUrl: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/meal-img/50_Fettuccine+Alfredo.jpg',
            cuisine: 'Italian Cuisine'
        },
        {
            id: 4,
            name: 'Mediterranean Salad',
            description: 'Fresh salad with feta, olives, and grilled vegetables.',
            imageUrl: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/meal-img/51_Mediterranean+Salad.jpg',
            cuisine: 'Mediterranean'
        }
    ];
    
    /**
     * Fetches signature dishes from the API when a cuisine is selected
     */
    useEffect(() => {
        if (!selectedCuisine) {
            setSignatureDishes([]);
            return;
        }

        const fetchSignatureDishes = async () => {
            setIsLoadingSignatureDishes(true);
            try {
                const apiUrl = `${config.apiUrl}/api/signature-dishes/`;
                
                const response = await axios.get<SignatureDish[]>(apiUrl, {
                    params: { cuisine: selectedCuisine }
                });
                
                setSignatureDishes(response.data);
            } catch (error) {
                console.error('Error fetching signature dishes:', error);
                setSignatureDishes([]);
            } finally {
                setIsLoadingSignatureDishes(false);
            }
        };

        fetchSignatureDishes();
    }, [selectedCuisine]);
    
    /**
     * Filters meals based on selected cuisine
     * @returns {Array} Filtered meal choices or signature dishes
     */
    const getMealsByFilter = () => {
        // If we have signature dishes for the selected cuisine, use those instead
        if (selectedCuisine && signatureDishes.length > 0) {
            return signatureDishes;
        }
        
        // If search query matches a cuisine category, show meals for that cuisine
        const cuisineMatch = popularMeals.find(cuisine => 
            cuisine.toLowerCase() === selectedCuisine?.toLowerCase()
        );
        
        if (cuisineMatch) {
            return allMealChoices.filter(meal => meal.cuisine === cuisineMatch);
        }
        
        // Default view
        return allMealChoices;
    };
    
    const filteredMealChoices = getMealsByFilter();
    
    /**
     * Adds a custom meal based on search query
     */
    const addSearchResultMeal = () => {
        if (!searchQuery.trim()) return;
        addCustomMeal(searchQuery);
        setSearchQuery('');
        addToast({
            title: "Meal Added",
            description: `"${searchQuery}" added as your selected meal`,
            classNames: {
              base: "bg-darkgreen",
              title: "text-white font-medium font-semibold",
              description: "text-white",
              icon: "text-white"
            }
          });
        
        // Scroll to selected meal component
        setTimeout(() => {
            if (selectedMealRef.current) {
                const yOffset = -80;
                const y = selectedMealRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 100);
    };
    
    // Check if search query exactly matches a popular meal or meal choice
    const exactMatchExists = popularMeals.some(meal => 
        meal.toLowerCase() === searchQuery.toLowerCase()
    ) || allMealChoices.some(meal => 
        meal.name.toLowerCase() === searchQuery.toLowerCase()
    );
    
    /**
     * Handles keyboard events in the search input
     * @param {React.KeyboardEvent<HTMLInputElement>} e - Keyboard event
     */
    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            if (exactMatchExists) {
                // If exact match exists, add that meal
                const matchedChoice = allMealChoices.find(meal => 
                    meal.name.toLowerCase() === searchQuery.toLowerCase()
                );
                
                if (matchedChoice) {
                    addMeal(matchedChoice);
                    setSearchQuery('');
                } else {
                    // Add from popular meals
                    const matchedPopular = popularMeals.find(meal => 
                        meal.toLowerCase() === searchQuery.toLowerCase()
                    );
                    
                    if (matchedPopular) {
                        addSearchResultMeal();
                    }
                }
            } else {
                // Add as custom meal
                addSearchResultMeal();
            }
        }
    };
    
    /**
     * Handles selection of a cuisine category
     * @param {string} cuisine - The cuisine category selected
     */
    const handleCuisineSelect = (cuisine: string) => {
        setSelectedCuisine(cuisine);
    };

    /**
     * Updates search query without affecting meal choices
     * This function only updates the search query without changing filtered meals
     */
    const handleSearchQueryChange = (query: string) => {
        setSearchQuery(query);
        // Do not change selectedCuisine or filter logic when searching
    };
    
    const handleGenerateAndScroll = () => {
        generateGroceryList();
        setTimeout(() => {
            if (groceryListRef.current) {
                const yOffset = -100; // Adjust this value to offset the scroll position
                const y = groceryListRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 100); // Small delay to ensure content is rendered
    };

    return (
        <div>
            <ToastProvider placement={"top-center"} toastOffset={80}/>
            <div>
                {/* Title */}
                <div className="py-12">
                <Title heading="Eco Grocery" 
                description="Create a precise shopping list to reduce food waste."
                background="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/ecogrocery-titlebg.jpeg"
                />
                </div>
                
                <div className="min-h-screen max-w-7xl mx-auto px-10 mt-8 mb-20">
                    {/* Search Section */}  
                    <Search 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        addSearchResultMeal={addSearchResultMeal}
                        handleSearchKeyPress={handleSearchKeyPress}
                    />
                    
                    {/* Popular Meals */}
                    <PopularMeal 
                        popularMeals={popularMeals}
                        setSearchQuery={handleCuisineSelect}
                    />
                    
                    {/* Meal Choices and Selected Meals (side by side) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Meal Choices (takes 2/3 of the width) */}
                        <div className="lg:col-span-2 h-full">
                            <MealChoice 
                                filteredMealChoices={filteredMealChoices}
                                addMeal={addMeal}
                                isLoading={isLoadingSignatureDishes && selectedCuisine !== null}
                                selectedCuisine={selectedCuisine}
                            />
                        </div>
                        
                        {/* Selected Meals (takes 1/3 of the width) */}
                        <div className="h-full" ref={selectedMealRef}>
                            <SelectedMeal 
                                selectedMeals={selectedMeals}
                                adjustQuantity={adjustQuantity}
                                removeMeal={removeMeal}
                                onGenerate={handleGenerateAndScroll}
                                loading={loading}
                            />
                        </div>
                    </div>
                    
                    {/* Grocery List and Food Inventory Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Grocery List */}
                        <div className="lg:col-span-2">
                            {/* Smart Grocery List */}
                            <GroceryList 
                                ref={groceryListRef}
                                selectedMeals={selectedMeals}
                                groceryItems={groceryItems}
                                pantryItems={pantryItems}
                                loading={loading}
                                error={error}
                                getGroceryItemsByCategory={getGroceryItemsByCategory}
                            />
                        </div>
                        
                        {/* Right Column - Food Inventory */}
                        <div className="h-full">
                            <PantrySummary />
                        </div>
                    </div>
                    
                    {/* Debug JSON Display Section */}
                    <div className="mt-12 mb-8 border-t pt-4">
                        <h2 className="text-xl font-semibold mb-4">Debug Data</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <JsonDebugDisplay data={selectedMeals} title="Selected Meals" />
                            <JsonDebugDisplay data={groceryItems} title="Grocery Items" />
                            <JsonDebugDisplay data={pantryItems} title="Pantry Items" />
                            <JsonDebugDisplay data={groceryList} title="Grocery List Response" />
                            <JsonDebugDisplay data={signatureDishes} title="Signature Dishes" />
                            <JsonDebugDisplay data={{ loading, error, selectedCuisine }} title="UI State" />
                        </div>
                    </div>
                    {/* Coming up next section */}
                    <ComingUp
                        message="Great Job in preventing food waste!"
                        title="Even with best practices, unwanted food could still pile up at home:"
                        description="Expore creative DIY ideas to reuse leftovers, revive produce, and reduce waste in fun and practical ways."
                        buttonText="Give Food a Second Life"
                        buttonLink="/second-life"
                        imageSrc="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/eco-grocery-next.png"
                        imageAlt="Seond Life"
                    />
                </div>
            </div>
        </div>
    );
}