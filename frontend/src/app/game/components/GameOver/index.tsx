/**
 * GameOver Component
 * Final screen showing game results and option to play again
 */
import React, { useRef, useState, useEffect } from 'react';
import { WasteStats, ResourcesApiResponse } from '../../interfaces';

interface GameOverProps {
  score: number;
  wasteStats: WasteStats;
  handleStartGame: () => void;
  gameResources: ResourcesApiResponse | null;
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
export default function GameOver({ score, wasteStats, handleStartGame, gameResources }: GameOverProps) {
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
    // Use passed gameResources instead of fetching them again
    const loadResources = () => {
      try {
        if (!gameResources) return;
        
        // Find badge resources by name
        const findResourceByName = (name: string) => {
          const lowerName = name.toLowerCase();
          return gameResources.resources?.find(
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
        gameResources.resources?.forEach((resource: GameResource) => {
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
  }, [wasteStats, gameResources]);

  const scrollToStats = () => {
    if (statsRef.current) {
      const startPosition = window.pageYOffset - 150;
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
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-lightgreen/30 to-green/30 backdrop-filter backdrop-blur-md rounded-2xl p-8 shadow-xl border border-green-200 mt-40">
          <div className="text-center">
            <div className="mb-6 relative">
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-yellow-400">
                <span className="text-3xl">🏆</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-2 pt-6 bg-gradient-to-r from-amber-600 to-amber-500 inline-block px-6 pt-2 pb-6 rounded-lg shadow-md">Game Complete!</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-emerald-300 mx-auto mb-4 rounded-full"></div>
              <p className="text-2xl text-gray-700 mb-6">Your Score: <span className="font-bold text-white px-3 py-1 rounded-md">{score}</span> points</p>
            </div>
            
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
            
            <p className="mt-8 text-lg text-gray-800">Please click "View Stats" to see your performance details!</p>
          </div>
        </div>

        <div className="h-[1000px]"></div>

        <div ref={statsRef} className="bg-white bg-opacity-60 backdrop-filter backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <h3 className="text-3xl font-bold text-center text-darkgreen mb-8">🌳 Your Game Results 🌳</h3>
          
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
              <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-md p-4 rounded-xl border border-green-100 shadow-md transform transition-all hover:shadow-lg">
                <h5 className="text-xl font-bold text-darkgreen mb-4 flex items-center border-l-4 border-darkgreen">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-2 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Personalized Tips
                </h5>
                <p className="text-darkgreen italic mb-4 font-semibold">{playerLevel.description}</p>
                <ul className="space-y-3">
                  {playerLevel.tips.map((tip, index) => (
                    <li key={index} className="flex gap-3 bg-lightgreen/30 bg-opacity-60 p-3 rounded-lg border border-green-100">
                      <span className="text-green-500 font-bold">✓</span>
                      <p className="text-gray-700 leading-relaxed">
                          {tip.includes(':') ? (
                            <>
                              <span className="font-bold">{tip.split(':')[0]}</span>
                              :{tip.split(':')[1]}
                            </>
                          ) : (
                            tip
                          )}
                        </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-white to-gray-50 bg-opacity-50 backdrop-filter backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-white bg-opacity-70">
                  <h5 className="text-xl font-bold text-red-400 mb-4 flex items-center border-l-4 border-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
                          <div className="flex justify-between items-center bg-white py-1 px-2 rounded-md shadow-sm border border-gray-100 text-xs">
                            <span className="text-gray-600 truncate pr-1 font-medium">{name}</span>
                            <span className="text-red-600 whitespace-nowrap bg-red-50 px-1.5 py-0.5 rounded-md">
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
                    <div className="bg-gray-50 h-[160px] flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-400 text-sm mt-2">Environmental info loading...</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-5 bg-red-50">
                  <div className="flex items-center bg-white p-4 rounded-lg shadow-inner border border-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mr-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-900">
                      If everyone in Melbourne wasted food like this, it would produce approximately
                      <br />
                      <span className="font-extrabold text-red-600 text-xl block mt-1 mb-1">
                        {Math.round(totalEmissions * MELBOURNE_POPULATION).toLocaleString()} kg
                      </span>
                      <span>of greenhouse gases.</span>
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