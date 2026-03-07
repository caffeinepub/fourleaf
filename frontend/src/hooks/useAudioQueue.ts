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
  isNowPlayingOpen: boolean;
  seekRequest: number | null;
  transitionContext: {
    sourceRect?: DOMRect;
    sourceImageUrl?: string;
  } | null;
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
  openNowPlaying: () => void;
  closeNowPlaying: () => void;
  requestSeek: (time: number) => void;
  clearSeekRequest: () => void;
  setTransitionContext: (context: { sourceRect?: DOMRect; sourceImageUrl?: string } | null) => void;
}

export const useAudioQueue = create<AudioQueueState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  isNowPlayingOpen: false,
  seekRequest: null,
  transitionContext: null,
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
      set({ 
        queue: [], 
        currentIndex: -1, 
        isPlaying: false, 
        currentTime: 0, 
        duration: 0,
        isNowPlayingOpen: false,
      });
    } else if (currentIndex >= newQueue.length) {
      set({ 
        queue: newQueue, 
        currentIndex: newQueue.length - 1, 
        currentTime: 0, 
        duration: 0 
      });
    } else {
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
      isNowPlayingOpen: false,
      transitionContext: null,
    });
  },
  openNowPlaying: () => set({ isNowPlayingOpen: true }),
  closeNowPlaying: () => set({ isNowPlayingOpen: false }),
  requestSeek: (time) => set({ seekRequest: time }),
  clearSeekRequest: () => set({ seekRequest: null }),
  setTransitionContext: (context) => set({ transitionContext: context }),
}));
