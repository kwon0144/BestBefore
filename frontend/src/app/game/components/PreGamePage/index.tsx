/**
 * PreGamePage Component
 * Initial game screen that shows game information and difficulty selection
 */
import React, { useState } from 'react';
import { FoodItem, Difficulty } from '../../interfaces';
import Image from 'next/image';
import { motion } from 'framer-motion';

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
  
  // Group food items by type
  const foodBankItems = foodItems.filter(item => {
    const typeStr = String(item.type || '').toLowerCase().trim();
    return typeStr === 'food bank';
  });
  
  const greenBinItems = foodItems.filter(item => {
    const typeStr = String(item.type || '').toLowerCase().trim();
    return typeStr === 'green waste bin';
  });

  // Group food items that can be DIYed
  const diyItems = foodItems.filter(item => {
    const diyOption = String(item.diy_option).toLowerCase();
    return diyOption === "1" || diyOption === "true";
  });

  if (loading) {
    return <div className="text-center py-8">Loading food items...</div>;
  }

  return (
    <div className="bg-white bg-opacity-60 backdrop-filter backdrop-blur-sm rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-darkgreen mb-6 text-center">🌳 How to Play: Food Waste Guide 🌳</h2>
      
      {/* Food Types Section */}
      <div className="space-y-6">
        {/* Food Bank Items */}
        <div className="border rounded-lg overflow-hidden">
          <div className="p-3 bg-blue-100 flex items-center border-b border-blue-100">
              <div className="text-blue-600 text-xl mr-2">🏢</div>
              <div>
              <h4 className="font-bold text-blue-800">Food Bank Items</h4>
              <p className="text-sm text-blue-600">Non-perishable, sealed, and safe to donate</p>
              </div>
          </div>
          <div className="p-4 bg-white bg-opacity-60 backdrop-filter backdrop-blur-sm">
            <div className="grid grid-cols-5 gap-3">
              {foodBankItems.map(item => (
                <div key={item.id} className="border rounded-lg p-2 bg-gray-50 bg-opacity-70">
                  <div className="w-full aspect-square relative mb-1">
                    <Image 
                      src={item.image} 
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-contain rounded-lg"
                      width={120}
                      height={120}
                    />
                  </div>
                  <h5 className="font-medium text-blue-800 text-center text-sm">{item.name}</h5>
                </div>
              ))}
            </div>
          </div>
        </div>
          
        {/* Green Bin Items */}
        <div className="border rounded-lg overflow-hidden">
          <div className="p-3 bg-lime-100 flex items-center border-b border-lime-100">
              <div className="text-lime-600 text-xl mr-2">♻️</div>
              <div>
              <h4 className="font-bold text-darkgreen">Green Bin Items</h4>
              <p className="text-sm text-darkgreen">Compostable food waste and scraps</p>
              </div>
          </div>
          <div className="p-4 bg-white bg-opacity-60 backdrop-filter backdrop-blur-sm">
            <div className="grid grid-cols-5 gap-3">
              {greenBinItems.map(item => (
                <div key={item.id} className="border rounded-lg p-2 bg-gray-50 bg-opacity-70">
                  <div className="w-full aspect-square relative mb-1">
                    <Image 
                      src={item.image} 
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-contain rounded-lg"
                      width={120}
                      height={120}
                    />
                  </div>
                  <h5 className="font-medium text-green-800 text-center text-sm">{item.name}</h5>
                </div>
              ))}
            </div>
          </div>
        </div>
          
        {/* DIY Items */}
        <div className="border rounded-lg overflow-hidden">
          <div className="p-3 bg-amber-100 bg-opacity-80 flex items-center border-b border-amber-100">
              <div className="text-amber-600 text-xl mr-2">🤲</div>
              <div>
                <h4 className="font-bold text-amber-800">DIY Items</h4>
                <p className="text-sm text-amber-600">Items that can be repurposed or upcycled</p>
              </div>
          </div>
          <div className="p-4 bg-white bg-opacity-60 backdrop-filter backdrop-blur-sm">
            <div className="grid grid-cols-5 gap-3">
              {diyItems.map(item => (
                <div key={item.id} className="border rounded-lg p-2 bg-gray-50 bg-opacity-70">
                  <div className="w-full aspect-square relative mb-1">
                    <Image 
                      src={item.image} 
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-contain rounded-lg"
                      width={120}
                      height={120}
                    />
                  </div>
                  <h5 className="font-medium text-yellow-800 text-center text-sm">{item.name}</h5>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-darkgreen mb-8 text-center">🌳 Select Difficulty 🌳</h3>
        <div className="flex gap-4">
          {['Easy', 'Normal', 'Hard'].map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level.toLowerCase() as Difficulty)}
              className={`flex-1 py-3 px-4 rounded-lg text-white font-semibold transition-all duration-300 transform hover:scale-105 ${
                difficulty === level.toLowerCase()
                  ? level === 'Easy' 
                    ? 'bg-gradient-to-r from-lightgreen to-green shadow-lg shadow-green'
                    : level === 'Normal'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-200'
                    : 'bg-gradient-to-r from-red-400 to-red-500 shadow-lg shadow-red-200'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 opacity-75 hover:opacity-100'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Start Game Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleStartGame}
          className="bg-[#16a34a] hover:bg-[#15803d] text-white py-4 px-12 rounded-full text-lg font-semibold shadow-lg shadow-green-200 transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
        >
          Start Game
        </button>
      </div>
    </div>
  );
} 