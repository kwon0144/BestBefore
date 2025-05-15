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

  // Load badge images when component mounts
  useEffect(() => {
    const loadBadgeImages = async () => {
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
        
        console.log('Found badge resources:', { rookieBadge, warriorBadge, heroBadge });
        
        setBadgeImages({
          rookie: rookieBadge?.image || null,
          warrior: warriorBadge?.image || null,
          hero: heroBadge?.image || null
        });
      } catch (error) {
        console.error('Failed to load badge images:', error);
      }
    };
    
    loadBadgeImages();
  }, []);

  const scrollToStats = () => {
    if (statsRef.current) {
      const startPosition = window.pageYOffset;
      const targetPosition = statsRef.current.getBoundingClientRect().top + startPosition;
      const distance = targetPosition - startPosition;
      const duration = 2000; // 2 seconds duration
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
        {/* Top Section - White Background */}
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-green-600 mb-4">Game Complete!</h2>
            <p className="text-2xl text-gray-700 mb-6">Your Score: <span className="font-bold text-green-600">{score}</span> points</p>
            
            {/* Main buttons */}
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

        {/* Large transparent space between sections */}
        <div className="h-[1000px]"></div>

        {/* Stats Section - White Background */}
        <div ref={statsRef} className="bg-white rounded-lg p-8 shadow-lg">
          <h3 className="text-3xl font-bold text-center text-green-600 mb-8">Your Game Results</h3>
          
          {/* Badge Display - Full Width */}
          <div className="w-full mb-10">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 overflow-hidden" style={{ height: "300px" }}>
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
            {/* Left Column - Tips */}
            <div className="space-y-6">
              {/* Personalized Tips Section */}
              <div className="bg-white p-6 rounded-xl border border-green-100">
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
            
            {/* Right Column - Wasted Food Items */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Wasted Food Items</h4>
              
              {Object.entries(wasteStats.wastedFoods).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(wasteStats.wastedFoods).map(([name, info]) => (
                    <div 
                      key={name}
                      className="flex justify-between items-center bg-red-50 p-3 rounded-lg border border-red-100"
                    >
                      <span className="text-gray-700">{name}</span>
                      <span className="font-semibold text-red-600">
                        × {info.count}
                      </span>
                    </div>
                  ))}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-lg text-gray-800 font-semibold">
                      Total Items Wasted: <span className="text-red-600">{wasteStats.totalWasted}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <div className="text-5xl mb-4">🏆</div>
                  <p className="text-lg text-green-600 font-semibold">
                    Perfect Score! No food was wasted!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Add bottom spacing */}
        <div className="h-24"></div>
      </div>
    </div>
  );
} 