/**
 * Sound effects utility for game audio
 * Handles playing different sound effects based on game actions
 */
import { SoundType, ResourcesApiResponse } from '../interfaces';

// Game resources for sound URLs
let gameResources: ResourcesApiResponse | null = null;

// Initialize sound resources
export const initSoundResources = (resources: ResourcesApiResponse) => {
    gameResources = resources;
};

// Get sound URLs from game resources
const getSoundUrls = (): Record<SoundType, string> => {
    if (!gameResources?.specificResources) {
        console.error('Game resources not initialized');
        return {
            donate: '',
            diyFood: '',
            gameStart: '',
            wasteFood: '',
            wrongAction: '',
            pickup: '',
            gameOver: '',
            backgroundMusic: ''
        };
    }

    return {
        donate: gameResources.specificResources.donate?.image || '',
        diyFood: gameResources.specificResources.diyFood?.image || '',
        gameStart: gameResources.specificResources.gameStart?.image || '',
        wasteFood: gameResources.specificResources.wasteFood?.image || '',
        wrongAction: gameResources.specificResources.wrongAction?.image || '',
        pickup: gameResources.specificResources.pickup?.image || '',
        gameOver: gameResources.specificResources.gameOver?.image || '',
        backgroundMusic: gameResources.specificResources.backgroundMusic?.image || ''
    };
};

// Volume settings for different sound types
const soundVolumes: Record<SoundType, number> = {
    donate: 0.3,
    diyFood: 0.3,
    gameStart: 0.3,
    wasteFood: 0.05, // Reduced volume
    wrongAction: 0.05, // Reduced volume
    pickup: 0.3,
    gameOver: 0.3,
    backgroundMusic: 0.2  // Background music at lower volume
};

// Singleton instance for background music to enable control
let backgroundMusicAudio: HTMLAudioElement | null = null;

/**
 * Plays a sound effect for a specific game action
 * @param type - The type of sound to play
 */
export const playSound = (type: SoundType): void => {
    if (typeof window === 'undefined') return;
    
    try {
        const soundUrls = getSoundUrls();
        const soundUrl = soundUrls[type];
        
        if (!soundUrl) {
            console.error(`Sound URL not found for type: ${type}`);
            return;
        }

        // Handle background music with singleton pattern
        if (type === 'backgroundMusic') {
            if (backgroundMusicAudio) {
                backgroundMusicAudio.currentTime = 0;
                backgroundMusicAudio.play().catch(() => {
                    // Auto-play may be blocked by browser policy
                });
                return;
            }
            
            backgroundMusicAudio = new Audio(soundUrl);
            backgroundMusicAudio.volume = soundVolumes[type];
            backgroundMusicAudio.loop = true; // Enable looping
            backgroundMusicAudio.play().catch(() => {
                // Auto-play may be blocked by browser policy
            });
            return;
        }
        
        // Handle one-shot sound effects
        const audio = new Audio(soundUrl);
        audio.volume = soundVolumes[type]; // Use type-specific volume
        audio.play().catch(() => {
            // Auto-play may be blocked by browser policy
        });
    } catch (error) {
        // Continue execution if sound playback fails
        console.error('Error playing sound:', error);
    }
};

/**
 * Stops the background music playback
 */
export const stopBackgroundMusic = (): void => {
    if (backgroundMusicAudio) {
        backgroundMusicAudio.pause();
        backgroundMusicAudio.currentTime = 0;
    }
}; 