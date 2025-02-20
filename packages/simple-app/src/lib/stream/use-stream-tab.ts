import type { JsonAbi } from 'fuels';
import { create } from 'zustand';
import { useConnection } from './use-connection';

export type StreamTabStore = {
  tab: 'data' | 'code';
  abi: JsonAbi | null;
  setTab: (tab: 'data' | 'code') => void;
  setAbi: (abi: JsonAbi | null) => Promise<void>;
};

export const useStreamTab = create<StreamTabStore>((set) => ({
  tab: 'data',
  abi: null,
  setTab: (tab) => set({ tab }),
  setAbi: async (abi) => {
    set({ abi });
    const { connect } = useConnection.getState();
    await connect(abi);
  },
}));
