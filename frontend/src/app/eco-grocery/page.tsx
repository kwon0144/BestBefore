"use client"

import { useState } from "react";
import Title from "../(components)/Title"
import { useGroceryPlanner } from "@/hooks/useGroceryPlanner";
import { PantrySummary } from "../(components)/Inventory";
import { MealChoice as MealChoiceType } from "./interfaces";

// Import new components from their folders
import Search from "./Search";
import PopularMeal from "./PopularMeal";
import MealChoice from "./MealChoice";
import SelectedMeal from "./SelectedMeal";
import GroceryList from "./GroceryList";

export default function EcoGrocery() {
    const [searchQuery, setSearchQuery] = useState('');
    
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
        'Grilled Chicken',
        'Beef Steak',
        'Salmon Fillet',
        'Pork Chops',
        'Turkey Breast',
        'Lamb Chops',
        'Tuna Steak',
        'Duck Breast'
    ];
    
    const mealChoices: MealChoiceType[] = [
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
    
    const addSearchResultMeal = () => {
        if (!searchQuery.trim()) return;
        addCustomMeal(searchQuery);
        setSearchQuery('');
    };
    
    // Filter meal choices by search query
    const filteredMealChoices = searchQuery
        ? mealChoices.filter(meal => 
            meal.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : mealChoices;
    
    // Check if search query exactly matches a popular meal or meal choice
    const exactMatchExists = popularMeals.some(meal => 
        meal.toLowerCase() === searchQuery.toLowerCase()
    ) || mealChoices.some(meal => 
        meal.name.toLowerCase() === searchQuery.toLowerCase()
    );
    
    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            if (exactMatchExists) {
                // If exact match exists, add that meal
                const matchedChoice = mealChoices.find(meal => 
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
                setSearchQuery={setSearchQuery}
            />
            
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Selected Meals and Grocery List */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Meal Choices */}
                    <MealChoice 
                        mealChoices={mealChoices}
                        filteredMealChoices={filteredMealChoices}
                        addMeal={addMeal}
                    />
                    
                    {/* Selected Meals */}
                    <SelectedMeal 
                        selectedMeals={selectedMeals}
                        adjustQuantity={adjustQuantity}
                        removeMeal={removeMeal}
                    />
                    
                    {/* Smart Grocery List */}
                    <GroceryList 
                        selectedMeals={selectedMeals}
                        groceryItems={groceryItems}
                        pantryItems={pantryItems}
                        loading={loading}
                        error={error}
                        groceryList={groceryList}
                        generateGroceryList={generateGroceryList}
                        getGroceryItemsByCategory={getGroceryItemsByCategory}
                    />
                </div>
                
                {/* Right Column - Food Inventory */}
                <div>
                    <PantrySummary 
                        ecoTipContent="Planning your meals and creating precise shopping lists can reduce food waste by up to 25%. Your smart choices help the planet!"
                    />
                </div>
            </div>
        </div>
    );
}