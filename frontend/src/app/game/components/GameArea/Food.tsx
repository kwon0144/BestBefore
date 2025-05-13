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
          className="food-item"
          style={{
            position: 'absolute',
            left: food.x,
            top: food.y,
            cursor: 'pointer',
            width: `${foodSize}px`,
            height: `${foodSize}px`,
            position: 'absolute'
          }}
        >
          <Image
            src={food.image}
            alt={food.name}
            width={50}
            height={50}
            style={{ objectFit: 'contain' }}
          />

        </div>
      ))}
    </>
  );
} 