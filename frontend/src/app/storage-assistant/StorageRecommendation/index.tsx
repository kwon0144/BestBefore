import React from 'react';
import { StorageRecommendation } from '../interfaces';
import { faSnowflake, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface StorageRecommendationsProps {
  storageRecs: StorageRecommendation;
}

const StorageRecommendations: React.FC<StorageRecommendationsProps> = ({ storageRecs }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[390px]">
      {/* Refrigerator section */}
      <div className="bg-white/70 rounded-lg p-5">
        <h3 className="text-xl font-medium text-gray-700 mb-4 pb-2 border-b-2 border-blue-500">
          <p className="font-semibold text-blue-600">Refrigerator</p>
        </h3>
          {storageRecs.fridge.length > 0 ? (
            <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {storageRecs.fridge.map((item, index) => (
                <li key={index} className="flex items-center p-3 rounded-lg bg-blue-100">
                  <span className="flex-grow">{item.name}</span>
                  <span className="text-black">Qty: {item.quantity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-gray-100">
                <FontAwesomeIcon icon={faSnowflake} className="text-gray-400 text-3xl" />
              </div>
              <p className="text-gray-500 italic mb-4">
                No items recommended for refrigerator
              </p>
            </div>
          )}
      </div>
      
      {/* Pantry section */}
      <div className="bg-white/70 rounded-lg p-5">
        <h3 className="text-xl font-medium text-gray-700 mb-4 pb-2 border-b-2 border-amber-700">
          <p className="font-semibold text-amber-700">Pantry</p>
        </h3>
          {storageRecs.pantry.length > 0 ? (
            <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {storageRecs.pantry.map((item, index) => (
                <li key={index} className="flex items-center p-3 rounded-lg bg-amber-100 transition-colors">
                  <span className="flex-grow">{item.name}</span>
                  <span className="text-black">Qty: {item.quantity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-gray-100">
                <FontAwesomeIcon icon={faBoxOpen} className="text-gray-400 text-3xl" />
              </div>
              <p className="text-gray-500 italic mb-4">
                No items recommended for pantry
              </p>
            </div>
          )}
        </div>
    </div>
  );
};

export default StorageRecommendations; 