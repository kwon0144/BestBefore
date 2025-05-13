/**
 * DropZones Component
 * Renders the food bank, green bin, and DIY zones
 */
import React from 'react';
import Image from 'next/image';

interface DropZonesProps {
  diyCooldown: number;
  foodBankImage?: string;
  greenBinImage?: string;
  diyImage?: string;
}

/**
 * Renders the drop zones where players can place food items
 */
export default function DropZones({ diyCooldown, foodBankImage, greenBinImage, diyImage }: DropZonesProps) {
  return (
    <>
      {/* Food Bank - positioned in the center-left of the U-shaped conveyor belt */}
      <div className="absolute top-[350px] left-[300px] w-[150px] h-[150px] flex flex-col items-center justify-center">
        {foodBankImage ? (

          <div className="w-24 h-24 flex items-center justify-center">
            <Image
              src={foodBankImage}
              alt="Food Bank"
              width={96}
              height={96}
              style={{ objectFit: 'contain' }}
            />
          </div>
        ) : (
          <span className="text-blue-500 text-5xl mb-2">🏢</span>
        )}
        <span className="font-bold text-blue-700 mt-2">Food Bank</span>
      </div>
      
      {/* Green Bin - positioned closer to the Food Bank */}
      <div className="absolute top-[350px] left-[500px] w-[150px] h-[150px] flex flex-col items-center justify-center">
        {greenBinImage ? (
          <div className="w-24 h-24 flex items-center justify-center">
            <Image
              src={greenBinImage}
              alt="Green Bin"
              width={96}
              height={96}
              style={{ objectFit: 'contain' }}

            />
          </div>
        ) : (
          <span className="text-green-500 text-5xl mb-2">♻️</span>
        )}
        <span className="font-bold text-green-700 mt-2">Green Waste Bin</span>
      </div>

      {/* DIY Place - positioned next to Green Bin */}
      <div className="absolute top-[350px] left-[700px] w-[150px] h-[150px] flex flex-col items-center justify-center">
        {diyImage ? (
          <div className="w-24 h-24 flex items-center justify-center">
            <Image
              src={diyImage}
              alt="DIY Place"
              width={96}
              height={96}
              style={{ objectFit: 'contain' }}

            />
          </div>
        ) : (
          <span className="text-yellow-500 text-5xl mb-2">🏠</span>
        )}
        <span className="font-bold text-yellow-700 mt-2">DIY Place</span>
        {diyCooldown > 0 && (
          <span className="absolute bottom-1 right-1 bg-yellow-200 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {diyCooldown}
          </span>
        )}
      </div>
    </>
  );
} 