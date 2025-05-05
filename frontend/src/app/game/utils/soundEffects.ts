/**
 * Sound effects utility for game audio
 * Handles playing different sound effects based on game actions
 */
import { SoundType } from '../interfaces';

/**
 * Sound URLs mapping for different game actions
 */
const soundUrls: Record<SoundType, string> = {
  donate: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/donate.wav',
  diyFood: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/donate.wav', // Reuse donate sound for DIY
  gameStart: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/gameStart.wav',
  wasteFood: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/wasteFodd.wav',
  wrongAction: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/wrongAction.wav',
  pickup: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/pickup.wav'
};

/**
 * Plays a sound effect for a specific game action
 * @param type - The type of sound to play
 */
export const playSound = (type: SoundType): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const audio = new Audio(soundUrls[type]);
    audio.volume = 0.3; // Set to 30% volume
    audio.play().catch(err => {
      // Silently fail on autoplay restrictions
      console.warn('Sound playback failed:', err.message);
    });
  } catch (error) {
    // Gracefully handle any errors with sound playback
    console.warn('Error playing sound:', error);
  }
}; 