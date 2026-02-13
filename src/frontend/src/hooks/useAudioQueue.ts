import { create } from 'zustand';
import type { Song, SongMetadata } from '../backend';

export type QueueItemSource = 'catalog' | 'personal';

export interface QueueItem {
  source: QueueItemSource;
  song: Song | SongMetadata;
}

interface AudioQueueState {
  queue: QueueItem[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  setQueue: (items: QueueItem[], startIndex?: number) => void;
  setCurrentIndex: (index: number) => void;
  next: () => void;
  previous: () => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  getCurrentItem: () => QueueItem | null;
  removeCurrent: () => void;
  closePlayer: () => void;
}

export const useAudioQueue = create<AudioQueueState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  setQueue: (items, startIndex = 0) => set({ queue: items, currentIndex: startIndex, currentTime: 0, duration: 0, isPlaying: false }),
  setCurrentIndex: (index) => set({ currentIndex: index, currentTime: 0, duration: 0 }),
  next: () => {
    const { queue, currentIndex, isPlaying } = get();
    if (currentIndex < queue.length - 1) {
      set({ currentIndex: currentIndex + 1, currentTime: 0, duration: 0, isPlaying });
    }
  },
  previous: () => {
    const { currentIndex, isPlaying } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1, currentTime: 0, duration: 0, isPlaying });
    }
  },
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume) => set({ volume }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  getCurrentItem: () => {
    const { queue, currentIndex } = get();
    return currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;
  },
  removeCurrent: () => {
    const { queue, currentIndex } = get();
    if (currentIndex < 0 || currentIndex >= queue.length) return;

    const newQueue = queue.filter((_, index) => index !== currentIndex);
    
    if (newQueue.length === 0) {
      // Queue is empty, reset everything
      set({ 
        queue: [], 
        currentIndex: -1, 
        isPlaying: false, 
        currentTime: 0, 
        duration: 0 
      });
    } else if (currentIndex >= newQueue.length) {
      // Removed last item, go to new last item
      set({ 
        queue: newQueue, 
        currentIndex: newQueue.length - 1, 
        currentTime: 0, 
        duration: 0 
      });
    } else {
      // Stay at same index (which now points to next song)
      set({ 
        queue: newQueue, 
        currentIndex, 
        currentTime: 0, 
        duration: 0 
      });
    }
  },
  closePlayer: () => {
    set({
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    });
  },
}));
