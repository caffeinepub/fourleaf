import { useCallback, useRef, useEffect } from 'react';
import { useUISoundSettings } from './useUISoundSettings';

export function useUISounds() {
  const { enabled, volume } = useUISoundSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio('/assets/sfx/ui-click.mp3');
    audioRef.current.preload = 'auto';
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Update volume when settings change
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playClick = useCallback(() => {
    if (!enabled || !audioRef.current) return;
    
    try {
      // Clone and play to allow overlapping sounds
      const sound = audioRef.current.cloneNode() as HTMLAudioElement;
      sound.volume = volume;
      sound.play().catch((err) => {
        // Silently fail if autoplay is blocked
        console.debug('UI sound playback blocked:', err);
      });
    } catch (err) {
      console.debug('UI sound error:', err);
    }
  }, [enabled, volume]);

  return { playClick };
}
