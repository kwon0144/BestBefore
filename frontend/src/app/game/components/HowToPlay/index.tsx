/**
 * HowToPlay Component
 * Game instructions screen that shows controls and gameplay information
 */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGamepad, 
  faBullseye, 
  faKeyboard, 
  faStar, 
  faArrowLeft, 
  faLeaf,
  faRecycle,
  faCutlery
} from '@fortawesome/free-solid-svg-icons';

interface HowToPlayProps {
  handleStartGame: () => void;
  handleBack: () => void;
}

/**
 * How to play instructions and game start button
 */
export default function HowToPlay({ handleStartGame, handleBack }: HowToPlayProps) {
  return (
    <div className="bg-gradient-to-br from-white to-green-50 bg-opacity-60 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-10 max-w-4xl mx-auto border border-green-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-green-100 opacity-30 blur-xl"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-blue-100 opacity-30 blur-xl"></div>
      
      <h2 className="text-3xl font-bold text-darkgreen mb-8 text-center relative">
        🌳 How to Play 🌳
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-green-300 via-green-500 to-green-300 rounded-full mt-2"></div>
      </h2>
      
      {/* Game Objective */}
      <div className="mb-8 transition-all duration-300 bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm p-6 rounded-2xl shadow-lg border-l-4 border-lightgreen">
        <div className="flex items-center mb-3">
          <div className="bg-lightgreen/50 p-3 rounded-full mr-3">
            <FontAwesomeIcon icon={faBullseye} className="text-2xl text-darkgreen" />
          </div>
          <h3 className="text-xl font-semibold text-darkgreen">Game Objective</h3>
        </div>
        <p className="text-gray-900 leading-relaxed">
          Sort food items by moving your character and picking up food from the conveyor belt.
          Place each food in the correct destination based on its condition to earn points and prevent food waste.
          You can also DIY new items from eligible food by taking them to the DIY Place.
        </p>
      </div>
      
      {/* Controls and Scoring in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Controls */}
        <div className="transition-all duration-300 bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm p-6 rounded-2xl shadow-lg border-l-4 border-blue-500 h-full flex flex-col">
          <div className="flex items-center mb-3">
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <FontAwesomeIcon icon={faGamepad} className="text-2xl text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-blue-700">Controls</h3>
          </div>
          <div className="flex flex-col justify-center items-center space-y-4 flex-grow">
            <div className="bg-blue-50/90 p-4 rounded-xl shadow-sm w-full">
              <div className="flex items-center space-x-3 mb-2 justify-center">
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm font-mono shadow">WASD</kbd>
                <span className="text-gray-600">or</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm font-mono shadow">↑↓←→</kbd>
              </div>
              <p className="text-gray-700 text-center">Move your character</p>
            </div>
            <div className="bg-blue-50/90 p-4 rounded-xl shadow-sm w-full">
              <div className="flex items-center space-x-3 mb-2 justify-center">
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm font-mono shadow">J</kbd>
                <span className="text-gray-600">or</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm font-mono shadow">Q</kbd>
              </div>
              <p className="text-gray-700 text-center">Pick up/drop food</p>
            </div>
          </div>
        </div>
        
        {/* Scoring */}
        <div className="transition-all duration-300 bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm p-6 rounded-2xl shadow-lg border-l-4 border-amber-500 h-full">
          <div className="flex items-center mb-3">
            <div className="bg-amber-100 p-3 rounded-full mr-3">
              <FontAwesomeIcon icon={faStar} className="text-2xl text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-amber-700">Scoring</h3>
          </div>
          
          <div className="space-y-2">
          <div className="bg-amber-50 rounded-xl p-2 flex items-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <span className="text-lg font-semibold text-amber-600">+10</span>
              </div>
              <p className="text-gray-700">Correctly donating or composting food</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-2 flex items-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <span className="text-lg font-semibold text-amber-600">+15</span>
              </div>
              <p className="text-gray-700">Creating a DIY item</p>
            </div>
            <div className="bg-red-50 rounded-xl p-2 flex items-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <span className="text-lg font-semibold text-red-600">-5</span>
              </div>
              <p className="text-gray-700">Incorrect placement</p>
            </div>
            <div className="bg-red-50 rounded-xl p-2 flex items-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <span className="text-lg font-semibold text-red-600">-5</span>
              </div>
              <p className="text-gray-700">Letting food fall off conveyor</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trophy Message */}
      <div className="mb-8 bg-gradient-to-r from-yellow-100 to-yellow-50 p-6 rounded-lg text-center shadow-inner transition-all duration-300">
        <p className="text-yellow-800 text-xl">
          🏆 Reach <span className="font-bold">100 points</span> to become a food waste sorting expert!
        </p>
      </div>
      
      {/* Buttons */}
      <div className="text-center flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={handleBack}
          className="bg-gray-500 hover:bg-gray-400 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all duration-300 ease-in-out flex items-center w-full sm:w-auto justify-center hover:scale-105 transition-all duration-300 hover:shadow-xl"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back
        </button>
        <button
          onClick={handleStartGame}
          className="bg-[#16a34a] hover:bg-[#15803d] text-white py-4 px-10 rounded-full font-semibold shadow-lg shadow-green-200 transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
        >
          <span className="relative z-10">Start Game</span>
        </button>
      </div>
    </div>
  );
} 