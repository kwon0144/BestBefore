/**
 * GameOver Component
 * Final screen showing game results and option to play again
 */
import React, { useRef, useState, useEffect } from 'react';
import { WasteStats } from '../../interfaces';
import { getGameResources } from '@/services/gameService';
import Image from 'next/image';

interface GameOverProps {
  score: number;
  wasteStats: WasteStats;
  handleStartGame: () => void;
}

// Interface for game resource
interface GameResource {
  id: number;
  name: string;
  type: string;
  image: string;
  description?: string;
  gamegas_emession?: number;
  greengas_emession?: number;
}

/**
 * Game over component showing final score and play again option
 */
export default function GameOver({ score, wasteStats, handleStartGame }: GameOverProps) {
  const statsRef = useRef<HTMLDivElement>(null);
  const [badgeImages, setBadgeImages] = useState<{
    rookie: string | null;
    warrior: string | null;
    hero: string | null;
  }>({
    rookie: null,
    warrior: null,
    hero: null
  });
  const [environmentalCard, setEnvironmentalCard] = useState<string | null>(null);
  const [foodEmissions, setFoodEmissions] = useState<{[key: string]: number}>({});
  const [totalEmissions, setTotalEmissions] = useState<number>(0);
  const MELBOURNE_POPULATION = 5160000;

  // Load badge images and environmental card when component mounts
  useEffect(() => {
    const loadResources = async () => {
      try {
        const resources = await getGameResources();
        
        // Find badge resources by name
        const findResourceByName = (name: string) => {
          const lowerName = name.toLowerCase();
          return resources.resources?.find(
            (r: GameResource) => r.name.toLowerCase() === lowerName || 
                 r.name.toLowerCase().includes(lowerName)
          );
        };
        
        const rookieBadge = findResourceByName('WasteRookieBadge');
        const warriorBadge = findResourceByName('WasteWarriorBadge');
        const heroBadge = findResourceByName('WasteHeroBadge');
        const envCard = findResourceByName('EnvironmentalCard');
        
        setBadgeImages({
          rookie: rookieBadge?.image || null,
          warrior: warriorBadge?.image || null,
          hero: heroBadge?.image || null
        });
        
        if (envCard?.image) {
          setEnvironmentalCard(envCard.image);
        }
        
        // Collect all food emissions data
        const emissionsData: {[key: string]: number} = {};
        resources.resources?.forEach((resource: GameResource) => {
          // Try different possible property names
          const emission = resource.gamegas_emession || resource.greengas_emession || 0;
          if (emission) {
            emissionsData[resource.name.toLowerCase()] = emission;
          }
        });
        
        // Calculate total emissions
        let totalGas = 0;
        Object.entries(wasteStats.wastedFoods).forEach(([name, info]) => {
          // First try to use emission data directly from wasteStats
          if (info.greengas_emession) {
            const emission = info.greengas_emession;
            totalGas += emission * info.count;
          } else {
            // Fallback to matching by name if direct data is not available
            const normalizedName = name.toLowerCase();
            const emission = emissionsData[normalizedName] || 0;
            totalGas += emission * info.count;
          }
        });
        
        // If total emissions is 0 and there are wasted food items, use a default value
        if (totalGas === 0 && Object.keys(wasteStats.wastedFoods).length > 0) {
          totalGas = 5;
        }
        
        setTotalEmissions(totalGas);
        setFoodEmissions(emissionsData);
        
      } catch (error) {
        // Error handling without console output
      }
    };
    
    loadResources();
  }, [wasteStats]);

  const scrollToStats = () => {
    if (statsRef.current) {
      const startPosition = window.pageYOffset;
      const targetPosition = statsRef.current.getBoundingClientRect().top + startPosition;
      const distance = targetPosition - startPosition;
      const duration = 2000;
      let start: number | null = null;

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);

        // Easing function for smoother animation
        const easeInOutQuad = (t: number) => {
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        };

        window.scrollTo(0, startPosition + (distance * easeInOutQuad(progress)));

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    }
  };

  // Determine player level based on score
  const getLevel = () => {
    if (score > 100) {
      return {
        level: 3,
        title: "Waste Hero",
        description: "You're leading the zero-waste movement — from your kitchen outward.",
        tips: [
          "Shelf-Life Pro: Store, freeze, and rotate foods like a chef to maximize freshness.",
          "Just-in-Time Genius: Build flexible, waste-free shopping lists with your app's assistant.",
          "Redistribute & Repurpose Like a Pro: Routinely donate extra food before expiry and turn \"waste\" into kimchi, stock, breadcrumbs — or compost gold."
        ]
      };
    } else if (score >= 50) {
      return {
        level: 2,
        title: "Waste Warrior",
        description: "You're making conscious choices — and your habits are creating real change.",
        tips: [
          "Expiry-Savvy Planning: Plan meals around food that's about to expire to avoid waste.",
          "Smart Shopping Sync: Use your real-time pantry inventory to guide your shopping.",
          "Give or Regrow: Donate unneeded items or turn scraps into garden boosters like compost or regrowth starters (e.g., spring onions!)."
        ]
      };
    } else {
      return {
        level: 1,
        title: "Waste Rookie",
        description: "You're starting your journey — every saved bite matters!",
        tips: [
          "Store Smarter: Track expiry dates and get gentle nudges before food spoils.",
          "Buy What You'll Use: Use smart meal-based shopping suggestions to avoid overbuying.",
          "Donate with Confidence: Use the map to find nearby food banks and drop off unopened, safe-to-donate items.",
          "Try a Tiny DIY: Start simple — make croutons from stale bread or turn citrus peels into natural cleaner."
        ]
      };
    }
  };

  const playerLevel = getLevel();

  // Get the appropriate badge image based on player level
  const getBadgeImage = () => {
    switch (playerLevel.level) {
      case 3:
        return badgeImages.hero;
      case 2:
        return badgeImages.warrior;
      case 1:
      default:
        return badgeImages.rookie;
    }
  };

  // Format waste statistics
  const formatWasteStats = () => {
    if (wasteStats.totalWasted === 0) {
      return "Perfect! You didn't waste any food!";
    }

    const wastedItems = Object.values(wasteStats.wastedFoods)
      .filter(item => item.count > 0)
      .map(item => `${item.count} ${item.name}${item.count > 1 ? 's' : ''}`)
      .join(', ');

    return `You wasted ${wasteStats.totalWasted} items: ${wastedItems}`;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white bg-opacity-60 backdrop-filter backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-green-600 mb-4">Game Complete!</h2>
            <p className="text-2xl text-gray-700 mb-6">Your Score: <span className="font-bold text-green-600">{score}</span> points</p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <button
                onClick={handleStartGame}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-3 px-8 rounded-lg text-lg font-bold text-yellow-900 hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🎮 Play Again
              </button>
              
              <button
                onClick={scrollToStats}
                className="bg-gradient-to-r from-emerald-400 to-emerald-500 py-3 px-8 rounded-lg text-lg font-bold text-emerald-900 hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                📊 View Stats
              </button>
            </div>
            
            <p className="mt-8 text-lg text-gray-600">Please click "View Stats" to see your performance details!</p>
          </div>
        </div>

        <div className="h-[1000px]"></div>

        <div ref={statsRef} className="bg-white bg-opacity-60 backdrop-filter backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <h3 className="text-3xl font-bold text-center text-green-600 mb-8">Your Game Results</h3>
          
          <div className="w-full mb-10">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 bg-opacity-70 rounded-xl border border-green-200 overflow-hidden" style={{ height: "300px" }}>
              <div className="flex justify-center items-center w-full h-full">
                {getBadgeImage() ? (
                  <img 
                    src={getBadgeImage() || ''} 
                    alt="Achievement Badge"
                    className="w-full h-full"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <span className="text-gray-400 text-2xl">Badge Loading...</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-sm p-6 rounded-xl border border-green-100">
                <h5 className="text-xl font-semibold text-green-700 mb-4">✅ Personalized Tips</h5>
                <ul className="space-y-3">
                  {playerLevel.tips.map((tip, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-green-600">●</span>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-white to-gray-50 bg-opacity-50 backdrop-filter backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-3 border-b border-gray-100 bg-white bg-opacity-40">
                  <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Wasted Food Items
                  </h5>
                  
                  {Object.entries(wasteStats.wastedFoods).length > 0 ? (
                    <div className="flex flex-wrap -mx-1">
                      {Object.entries(wasteStats.wastedFoods).map(([name, info]) => (
                        <div 
                          key={name}
                          className="px-1 w-1/2 mb-1"
                        >
                          <div className="flex justify-between items-center bg-white bg-opacity-50 py-0.5 px-2 rounded-full shadow-sm border border-gray-100 text-xs">
                            <span className="text-gray-600 truncate pr-1 font-medium">{name}</span>
                            <span className="text-red-500 whitespace-nowrap bg-red-50 px-1.5 py-0.5 rounded-full">
                              {info.count} kg
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-12 text-center">
                      <div className="bg-green-50 bg-opacity-50 py-1 px-3 rounded-full flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-green-700 font-medium">
                          Perfect! No food was wasted!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="w-full">
                  {environmentalCard ? (
                    <div className="overflow-hidden">
                      <img 
                        src={environmentalCard} 
                        alt="Environmental Impact" 
                        className="w-full object-cover h-[160px]"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 bg-opacity-40 h-[160px] flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-400 text-sm mt-2">Environmental info loading...</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 bg-opacity-50">
                  <div className="flex items-center">
                    <p className="text-gray-700 text-sm">
                      If everyone in Melbourne wasted food like this, it would produce approximately
                      <span className="font-bold text-red-600 mx-1">
                        {Math.round(totalEmissions * MELBOURNE_POPULATION).toLocaleString()}
                      </span>
                      kg of greenhouse gases.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="h-24"></div>
      </div>
    </div>
  );
} 