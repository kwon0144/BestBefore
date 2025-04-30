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

import { useState, useEffect } from "react";
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

/**
 * EcoGrocery page component for meal planning and grocery list generation
 * 
 * @returns {JSX.Element} Rendered component with meal planning and grocery list interfaces
 */
export default function EcoGrocery() {
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
        if (searchQuery.trim()) {
            addCustomMeal(searchQuery);
            setNotification(`${searchQuery} added!`);
            setSearchQuery('');
            
            // Hide notification after 3 seconds
            setTimeout(() => {
                setNotification(null);
            }, 3000);
        }
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
    
    return (
        <div className="min-h-screen max-w-7xl mx-auto py-20 px-10">
            {/* Title */}
            <Title heading="Eco Grocery" description="Create a precise shopping list to reduce food waste." />
            
            {/* Notification Banner */}
            {notification && (
                <div className="bg-green-100 border border-green-300 text-green-800 text-base font-medium px-3 py-2 rounded-md mb-4 text-center shadow-sm max-w-lg mx-auto">
                    {notification}
                </div>
            )}
            
            {/* Search Section */}
            <Search 
                searchQuery={searchQuery}
                setSearchQuery={handleSearchQueryChange}
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
                <div className="lg:col-span-2 h-full flex flex-col">
                    <MealChoice 
                        filteredMealChoices={filteredMealChoices}
                        addMeal={addMeal}
                        isLoading={isLoadingSignatureDishes && selectedCuisine !== null}
                        selectedCuisine={selectedCuisine}
                    />
                </div>
                
                {/* Selected Meals (takes 1/3 of the width) */}
                <div className="h-full flex flex-col">
                    <SelectedMeal 
                        selectedMeals={selectedMeals}
                        adjustQuantity={adjustQuantity}
                        removeMeal={removeMeal}
                        generateGroceryList={generateGroceryList}
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
                        selectedMeals={selectedMeals}
                        groceryItems={groceryItems}
                        pantryItems={pantryItems}
                        loading={loading}
                        error={error}
                        groceryList={groceryList}
                        getGroceryItemsByCategory={getGroceryItemsByCategory}
                    />
                </div>
                
                {/* Right Column - Food Inventory */}
                <div className="h-full">
                    <PantrySummary />
                </div>
            </div>     
        </div>
    );
}