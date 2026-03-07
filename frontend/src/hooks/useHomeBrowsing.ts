import { create } from 'zustand';

export type HomeTab = 'All' | 'Music' | 'Podcast';

interface HomeBrowsingState {
  activeTab: HomeTab;
  scrollToBrowsingRequested: number;
  setActiveTab: (tab: HomeTab) => void;
  requestScrollToBrowsing: () => void;
  resetBrowsingFilters: () => void;
}

export const useHomeBrowsing = create<HomeBrowsingState>((set) => ({
  activeTab: 'All',
  scrollToBrowsingRequested: 0,
  setActiveTab: (tab) => set({ activeTab: tab }),
  requestScrollToBrowsing: () => set((state) => ({ scrollToBrowsingRequested: state.scrollToBrowsingRequested + 1 })),
  resetBrowsingFilters: () => set({ activeTab: 'All' }),
}));
