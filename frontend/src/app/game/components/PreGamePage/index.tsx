/**
 * PreGamePage Component
 * Initial game screen that shows game information and difficulty selection
 */
import React, { useState } from 'react';
import { Button } from "@heroui/react";
import { FoodItem, Difficulty } from '../../interfaces';
import Image from 'next/image';

interface PreGamePageProps {
  foodItems: FoodItem[];
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
  handleStartGame: () => void;
  loading: boolean;
}

/**
 * Pre-game page component showing food types, items, and difficulty selection
 */
export default function PreGamePage({
  foodItems,
  difficulty,
  setDifficulty,
  handleStartGame,
  loading
}: PreGamePageProps) {
  // States for collapsible sections
  const [expandedFoodBank, setExpandedFoodBank] = useState(false);
  const [expandedGreenBin, setExpandedGreenBin] = useState(false);
  const [expandedTrash, setExpandedTrash] = useState(false);
  const [expandedDiy, setExpandedDiy] = useState(false);
  
  // Debug: log food items to check diy_option values
  console.log('All food items:', foodItems);
  console.log('Food items with DIY options:', foodItems.map(item => ({
    name: item.name,
    diy_option: item.diy_option,
    type: typeof item.diy_option
  })));
  
  // Group food items by type
  const foodBankItems = foodItems.filter(item => {
    const typeStr = String(item.type || '').toLowerCase().trim();
    return typeStr === 'food bank';
  });
  
  const greenBinItems = foodItems.filter(item => {
    const typeStr = String(item.type || '').toLowerCase().trim();
    return typeStr === 'green waste bin';
  });
  
  const trashItems = foodItems.filter(item => {
    const typeStr = String(item.type || '').toLowerCase().trim();
    return typeStr === 'trash';
  });

  // Simple print of all food items
  console.log('All food items count:', foodItems.length);
  
  // Add more debug information
  console.log('Raw DIY values:', foodItems.map(item => ({
    name: item.name,
    diy_raw: item.diy_option,
    type: item.type,
    diy_string: String(item.diy_option),
    image: item.image
  })));
  
  // Group food items that can be DIYed (based on diy_option property)
  // Try more direct string comparison to determine DIY items
  const diyItems = foodItems.filter(item => {
    // For debugging
    console.log(`Item ${item.name} - diy_option: ${item.diy_option}, type: ${typeof item.diy_option}`);
    
    // Convert to string for safe comparison
    const diyOption = String(item.diy_option).toLowerCase();
    
    // Check if diy_option is truthy (1 or true)
    return diyOption === "1" || diyOption === "true";
  });
  
  console.log('DIY items found:', diyItems.length);

  if (loading) {
    return <div className="text-center py-8">Loading food items...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Food Waste Guide</h2>
      
      {/* Food Types Section with Collapsible Lists */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-green-700 mb-4">Food Types:</h3>
        <div className="grid grid-cols-1 gap-4">
          {/* Food Bank Items */}
          <div className="border rounded-lg overflow-hidden">
            <div 
              className="p-4 bg-blue-50 flex justify-between items-center cursor-pointer"
              onClick={() => setExpandedFoodBank(!expandedFoodBank)}
            >
              <div>
                <h4 className="font-bold text-blue-800">Food Bank Items</h4>
                <p className="text-sm text-blue-600">Non-perishable, sealed, and safe to donate</p>
              </div>
              <div className="text-blue-800">
                {expandedFoodBank ? '▲' : '▼'}
              </div>
            </div>
            
            {expandedFoodBank && (
              <div className="p-4 bg-white">
                {foodBankItems.length === 0 ? (
                  <p className="text-center text-gray-500">No food bank items available</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {foodBankItems.map(item => (
                      <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="w-full aspect-square relative mb-2">
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-contain rounded-lg"
                            width={200}
                            height={200}
                          />
                        </div>
                        <h5 className="font-medium text-blue-800 text-center">{item.name}</h5>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Green Bin Items */}
          <div className="border rounded-lg overflow-hidden">
            <div 
              className="p-4 bg-green-50 flex justify-between items-center cursor-pointer"
              onClick={() => setExpandedGreenBin(!expandedGreenBin)}
            >
              <div>
                <h4 className="font-bold text-green-800">Green Bin Items</h4>
                <p className="text-sm text-green-600">Compostable food waste and scraps</p>
              </div>
              <div className="text-green-800">
                {expandedGreenBin ? '▲' : '▼'}
              </div>
            </div>
            
            {expandedGreenBin && (
              <div className="p-4 bg-white">
                {greenBinItems.length === 0 ? (
                  <p className="text-center text-gray-500">No green bin items available</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {greenBinItems.map(item => (
                      <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="w-full aspect-square relative mb-2">
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-contain rounded-lg"
                            width={200}
                            height={200}
                          />
                        </div>
                        <h5 className="font-medium text-green-800 text-center">{item.name}</h5>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Trash Items */}
          <div className="border rounded-lg overflow-hidden">
            <div 
              className="p-4 bg-red-50 flex justify-between items-center cursor-pointer"
              onClick={() => setExpandedTrash(!expandedTrash)}
            >
              <div>
                <h4 className="font-bold text-red-800">Trash Items</h4>
                <p className="text-sm text-red-600">Cannot be eaten, donated, or composted</p>
              </div>
              <div className="text-red-800">
                {expandedTrash ? '▲' : '▼'}
              </div>
            </div>
            
            {expandedTrash && (
              <div className="p-4 bg-white">
                {trashItems.length === 0 ? (
                  <p className="text-center text-gray-500">No trash items available</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trashItems.map(item => (
                      <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="w-full aspect-square relative mb-2">
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-contain rounded-lg"
                            width={200}
                            height={200}
                          />
                        </div>
                        <h5 className="font-medium text-red-800 text-center">{item.name}</h5>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DIY Items */}
          <div className="border rounded-lg overflow-hidden">
            <div 
              className="p-4 bg-yellow-50 flex justify-between items-center cursor-pointer"
              onClick={() => setExpandedDiy(!expandedDiy)}
            >
              <div>
                <h4 className="font-bold text-yellow-800">DIY Items</h4>
                <p className="text-sm text-yellow-600">Food items that can be repurposed into something new</p>
              </div>
              <div className="text-yellow-800">
                {expandedDiy ? '▲' : '▼'}
              </div>
            </div>
            
            {expandedDiy && (
              <div className="p-4 bg-white">
                {diyItems.length === 0 ? (
                  <p className="text-center text-gray-500">No DIY items available</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {diyItems.map(item => (
                      <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="w-full aspect-square relative mb-2">
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-contain rounded-lg"
                            width={200}
                            height={200}
                          />
                          <div className="absolute top-1 right-1 w-5 h-5 bg-yellow-400 rounded-full" title="DIY Item"></div>
                        </div>
                        <h5 className="font-medium text-yellow-800 text-center">{item.name}</h5>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-green-700 mb-4">Select Difficulty:</h3>
        <div className="flex gap-4 justify-center">
          <Button
            onPress={() => setDifficulty('easy')}
            className={`py-2 px-6 rounded-lg ${
              difficulty === 'easy'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-green-600 hover:bg-gray-200'
            }`}
          >
            Easy
          </Button>
          <Button
            onPress={() => setDifficulty('normal')}
            className={`py-2 px-6 rounded-lg ${
              difficulty === 'normal'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-green-600 hover:bg-gray-200'
            }`}
          >
            Normal
          </Button>
          <Button
            onPress={() => setDifficulty('hard')}
            className={`py-2 px-6 rounded-lg ${
              difficulty === 'hard'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-green-600 hover:bg-gray-200'
            }`}
          >
            Hard
          </Button>
        </div>
      </div>

      {/* Start Game Button */}
      <Button
        onPress={handleStartGame}
        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
      >
        Start Game
      </Button>
    </div>
  );
} 