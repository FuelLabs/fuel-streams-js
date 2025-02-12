import { create } from 'zustand';

export type StreamTabStore = {
  tab: 'data' | 'code';
  setTab: (tab: 'data' | 'code') => void;
};

export const useStreamTab = create<StreamTabStore>((set) => ({
  tab: 'data',
  setTab: (tab) => set({ tab }),
}));
