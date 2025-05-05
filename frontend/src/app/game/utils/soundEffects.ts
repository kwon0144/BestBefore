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
  eatFood: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/eatFood.wav',
  gameStart: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/gameStart.wav',
  wasteFood: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/wasteFodd.wav',
  wrongAction: 'https://s3-tp22.s3.ap-southeast-2.amazonaws.com/Game/wrongAction.wav'
};

/**
 * Plays a sound effect for a specific game action
 * @param type - The type of sound to play
 */
export const playSound = (type: SoundType): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const audio = new Audio(soundUrls[type]);
    audio.volume = 0.5;
    
    // Add event listeners for debugging
    audio.addEventListener('play', () => console.log(`Sound ${type} started playing`));
    audio.addEventListener('error', (e) => console.error(`Sound ${type} error:`, e));
    
    // Play the sound
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.error(`Audio play failed for ${type}:`, err);
      });
    }
  } catch (err) {
    console.error('Sound playback error:', err);
  }
}; 