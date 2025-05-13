/**
 * Food Component
 * Renders food items on the conveyor belt
 */
import React from 'react';
import Image from 'next/image';
import { Food as FoodType } from '../../interfaces';

interface FoodProps {
  foods: FoodType[];
  foodSize: number;
}

/**
 * Renders food items on the conveyor belt
 */
export default function Food({ foods, foodSize }: FoodProps) {
  return (
    <>
      {foods.map(food => (
        <div
          key={food.id}
          className="absolute"
          style={{
            left: `${food.x}px`,
            top: `${food.y}px`,
            width: `${foodSize}px`,
            height: `${foodSize}px`,
            position: 'absolute'
          }}
        >
          <div className="relative w-full h-full">
            <Image
              src={food.image}
              alt={food.name}
              fill
              className="object-contain"
              sizes={`${foodSize}px`}
            />
          </div>
        </div>
      ))}
    </>
  );
} 