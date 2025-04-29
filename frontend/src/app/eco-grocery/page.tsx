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


export default function EcoGrocery() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
    const [signatureDishes, setSignatureDishes] = useState<SignatureDish[]>([]);
    const [isLoadingSignatureDishes, setIsLoadingSignatureDishes] = useState(false);
    
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
    
    // Fetch signature dishes when a cuisine is selected
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
    
    // Filter meals based on selected cuisine from popular meals or search query
    const getMealsByFilter = () => {
        // If we have signature dishes for the selected cuisine, use those instead
        if (selectedCuisine && signatureDishes.length > 0) {
            return signatureDishes;
        }
        
        // If search query matches a cuisine category, show meals for that cuisine
        const cuisineMatch = popularMeals.find(cuisine => 
            cuisine.toLowerCase() === searchQuery.toLowerCase()
        );
        
        if (cuisineMatch) {
            return allMealChoices.filter(meal => meal.cuisine === cuisineMatch);
        }
        
        // For search by name
        if (searchQuery) {
            return allMealChoices.filter(meal => 
                meal.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Default view
        return allMealChoices;
    };
    
    const filteredMealChoices = getMealsByFilter();
    
    const addSearchResultMeal = () => {
        if (!searchQuery.trim()) return;
        addCustomMeal(searchQuery);
        setSearchQuery('');
    };
    
    // Check if search query exactly matches a popular meal or meal choice
    const exactMatchExists = popularMeals.some(meal => 
        meal.toLowerCase() === searchQuery.toLowerCase()
    ) || allMealChoices.some(meal => 
        meal.name.toLowerCase() === searchQuery.toLowerCase()
    );
    
    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            if (exactMatchExists) {
                // If exact match exists, add that meal
                const matchedChoice = allMealChoices.find(meal => 
                    meal.name.toLowerCase() === searchQuery.toLowerCase()
                );
                
                if (matchedChoice) {
                    addMeal(matchedChoice);
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
    
    // Handle cuisine selection
    const handleCuisineSelect = (cuisine: string) => {
        setSearchQuery(cuisine);
        setSelectedCuisine(cuisine);
    };
    
    return (
        <div className="min-h-screen max-w-7xl mx-auto py-20 px-10">
            {/* Title */}
            <Title heading="Eco Grocery" description="Create a precise shopping list to reduce food waste." />
            
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
                <div className="h-full">
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