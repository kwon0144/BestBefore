/**
 * HowToPlay Component
 * Game instructions screen that shows controls and gameplay information
 */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGamepad, faBullseye, faKeyboard, faStar, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface HowToPlayProps {
  handleStartGame: () => void;
  handleBack: () => void;
}

/**
 * How to play instructions and game start button
 */
export default function HowToPlay({ handleStartGame, handleBack }: HowToPlayProps) {
  return (
    <div className="bg-gradient-to-br from-white to-green-50 bg-opacity-60 backdrop-filter backdrop-blur-sm rounded-2xl shadow-2xl p-10 max-w-3xl mx-auto border border-green-100">
      <h2 className="text-3xl font-bold text-green-800 mb-8 text-center relative">
        How to Play
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-green-500 rounded-full mt-2"></div>
      </h2>
      
      {/* Game Objective */}
      <div className="mb-8 transform hover:scale-[1.02] transition-transform duration-300 bg-white bg-opacity-50 backdrop-filter backdrop-blur-sm p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-3">
          <FontAwesomeIcon icon={faBullseye} className="text-2xl text-green-600 mr-3" />
          <h3 className="text-xl font-semibold text-green-700">Game Objective</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          Sort food items by moving your character and picking up food from the conveyor belt.
          Place each food in the correct destination based on its condition to earn points and prevent food waste.
          You can also DIY new items from eligible food by taking them to the DIY Place.
        </p>
      </div>
      
      {/* Controls */}
      <div className="mb-8 transform hover:scale-[1.02] transition-transform duration-300 bg-white bg-opacity-50 backdrop-filter backdrop-blur-sm p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-3">
          <FontAwesomeIcon icon={faGamepad} className="text-2xl text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold text-blue-700">Controls</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/80 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm">WASD</kbd>
              <span className="text-gray-600">or</span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm">↑↓←→</kbd>
            </div>
            <p className="text-gray-700">Move your character</p>
          </div>
          <div className="bg-white/80 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm">Q</kbd>
              <span className="text-gray-600">or</span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm">J</kbd>
            </div>
            <p className="text-gray-700">Pick up/drop food</p>
          </div>
        </div>
      </div>
      
      {/* Scoring */}
      <div className="mb-8 transform hover:scale-[1.02] transition-transform duration-300 bg-white bg-opacity-50 backdrop-filter backdrop-blur-sm p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-3">
          <FontAwesomeIcon icon={faStar} className="text-2xl text-yellow-500 mr-3" />
          <h3 className="text-xl font-semibold text-yellow-700">Scoring</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center text-green-600">
              <span className="text-lg font-semibold mr-2">+10</span>
              <p>Correctly donating or composting food</p>
            </div>
            <div className="flex items-center text-yellow-600">
              <span className="text-lg font-semibold mr-2">+15</span>
              <p>Creating a DIY item</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center text-red-500">
              <span className="text-lg font-semibold mr-2">-5</span>
              <p>Incorrect placement</p>
            </div>
            <div className="flex items-center text-red-500">
              <span className="text-lg font-semibold mr-2">-5</span>
              <p>Letting food fall off conveyor</p>
            </div>
          </div>
        </div>
        <div className="mt-4 bg-yellow-50 bg-opacity-60 p-3 rounded-lg text-center">
          <p className="text-yellow-800">
            🏆 Reach <span className="font-bold">100 points</span> to become a food waste sorting expert!
          </p>
        </div>
      </div>
      
      {/* Buttons */}
      <div className="text-center flex items-center justify-center space-x-4">
        <button
          onClick={handleBack}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-gray-200 hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back
        </button>
        <button
          onClick={handleStartGame}
          className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-4 px-12 rounded-full shadow-lg shadow-green-200 hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out animate-pulse"
        >
          Start Game
        </button>
      </div>
    </div>
  );
} 