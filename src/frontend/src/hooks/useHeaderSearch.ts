import { create } from 'zustand';

interface HeaderSearchState {
  query: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
}

export const useHeaderSearch = create<HeaderSearchState>((set) => ({
  query: '',
  setQuery: (query: string) => set({ query }),
  clearQuery: () => set({ query: '' }),
}));
