/**
 * PreGamePage Component
 * Initial game screen that shows game information and difficulty selection
 */
import React from 'react';
import { Button } from "@heroui/react";
import { FoodItem, Difficulty } from '../../interfaces';

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
  if (loading) {
    return <div className="text-center py-8">Loading food items...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Food Waste Guide</h2>
      
      {/* Food Types Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-green-700 mb-4">Food Types:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-bold text-blue-800">Food Bank Items</h4>
            <p className="text-sm text-blue-600">Non-perishable, sealed, and safe to donate</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-bold text-green-800">Green Bin Items</h4>
            <p className="text-sm text-green-600">Compostable food waste and scraps</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-bold text-yellow-800">Both Types</h4>
            <p className="text-sm text-yellow-600">Can be donated or composted</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-bold text-red-800">Trash Items</h4>
            <p className="text-sm text-red-600">Cannot be eaten, donated, or composted</p>
          </div>
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-green-700 mb-4">Available Food Items:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {foodItems.map(item => (
            <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
              <h4 className="font-bold text-green-800">{item.name}</h4>
              <p className="text-sm text-gray-600">Type: {item.type}</p>
            </div>
          ))}
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