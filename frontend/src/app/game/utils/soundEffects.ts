/**
 * Sound effects utility for game audio
 * Handles playing different sound effects based on game actions
 */
import { SoundType } from '../interfaces';

/**
 * Sound URLs mapping for different game actions
 */
const soundUrls: Record<SoundType, string> = {
  donate: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/others/donate.mp3',
  diyFood: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/others/donate.mp3',
  gameStart: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/others/gameStart.mp3',
  wasteFood: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/others/wrongAction.mp3',
  wrongAction: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/others/wrongAction.mp3',
  pickup: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/others/pickup.mp3',
  gameOver: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/others/gameOver.mp3'
};

// Volume settings for different sound types
const soundVolumes: Record<SoundType, number> = {
  donate: 0.3,
  diyFood: 0.3,
  gameStart: 0.3,
  wasteFood: 0.05, // Reduced volume
  wrongAction: 0.05, // Reduced volume
  pickup: 0.3,
  gameOver: 0.3
};

/**
 * Plays a sound effect for a specific game action
 * @param type - The type of sound to play
 */
export const playSound = (type: SoundType): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const audio = new Audio(soundUrls[type]);
    audio.volume = soundVolumes[type]; // Use type-specific volume
    audio.play().catch(err => {
      // Silently fail on autoplay restrictions
      console.warn('Sound playback failed:', err.message);
    });
  } catch (error) {
    // Gracefully handle any errors with sound playback
    console.warn('Error playing sound:', error);
  }
}; 