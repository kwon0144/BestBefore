import React from 'react';
import { StorageRecommendation } from '../interfaces';

interface StorageRecommendationsProps {
  storageRecs: StorageRecommendation;
}

const StorageRecommendations: React.FC<StorageRecommendationsProps> = ({ storageRecs }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Refrigerator section */}
      <div className="bg-gray-50 rounded-lg p-5">
        <h3 className="text-xl font-medium text-gray-700 mb-4">
          Refrigerator
        </h3>
        <div className="bg-white rounded-lg p-4 min-h-64">
          {storageRecs.fridge.length > 0 ? (
            <ul className="space-y-3">
              {storageRecs.fridge.map((item, index) => (
                <li key={index} className="flex items-center p-2 border-b border-gray-100 last:border-0">
                  <span className="text-green-500 mr-2">&#8226;</span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic text-center">
              No items recommended for refrigerator
            </p>
          )}
        </div>
      </div>
      
      {/* Pantry section */}
      <div className="bg-gray-50 rounded-lg p-5">
        <h3 className="text-xl font-medium text-gray-700 mb-4">
          Pantry
        </h3>
        <div className="bg-white rounded-lg p-4 min-h-64">
          {storageRecs.pantry.length > 0 ? (
            <ul className="space-y-3">
              {storageRecs.pantry.map((item, index) => (
                <li key={index} className="flex items-center p-2 border-b border-gray-100 last:border-0">
                  <span className="text-amber-500 mr-2">&#8226;</span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic text-center">
              No items recommended for pantry
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorageRecommendations; 