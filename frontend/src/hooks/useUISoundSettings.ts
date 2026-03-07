import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UISoundSettings {
  enabled: boolean;
  volume: number;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
}

export const useUISoundSettings = create<UISoundSettings>()(
  persist(
    (set) => ({
      enabled: true,
      volume: 0.5,
      setEnabled: (enabled) => set({ enabled }),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    }),
    {
      name: 'fourleaf-ui-sound-settings',
    }
  )
);
