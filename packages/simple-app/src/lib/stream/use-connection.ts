import { Client, ClientError, type Connection } from '@fuels/streams';
import { FuelNetwork } from '@fuels/streams';
import { useEffect, useLayoutEffect } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';
import { LocalStorage } from '../local-storage';

const networkStorage = new LocalStorage('@fuel-streams/network');
const apiKeyStorage = new LocalStorage('@fuel-streams/api-key');

function getDefaultNetwork(): FuelNetwork {
  const network = networkStorage.get<FuelNetwork>();
  if (network) return network;
  if (import.meta.env.DEV) return FuelNetwork.Staging;
  return FuelNetwork.Mainnet;
}

type ConnectionStore = {
  connection: Connection | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: Error | null;
  network: FuelNetwork;
  apiKey: string | null;

  // Actions
  setNetwork: (network: FuelNetwork) => Promise<void>;
  setApiKey: (apiKey: string | null) => Promise<void>;
  connect: () => Promise<Connection | null>;
  disconnect: () => void;
};

export const useConnection = create<ConnectionStore>((set, get) => ({
  connection: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  network: getDefaultNetwork(),
  apiKey: apiKeyStorage.get<string>(),

  setNetwork: async (network) => {
    networkStorage.set(network);
    set({ network });
    await get().connect();
  },

  setApiKey: async (apiKey) => {
    if (apiKey) {
      apiKeyStorage.set(apiKey);
    } else {
      apiKeyStorage.remove();
    }
    set({ apiKey });
    await get().connect();
  },

  connect: async (): Promise<Connection | null> => {
    set({ isConnecting: true, error: null });
    const { network, apiKey } = get();

    if (!apiKey) {
      const error = new Error('API Key is required');
      set({ error });
      toast.warning(error.message);
      return null;
    }

    try {
      const connection = await Client.connect(network, apiKey);
      set({
        connection,
        isConnected: true,
        isConnecting: false,
        error: null,
      });
      return connection;
    } catch (error) {
      if (error instanceof ClientError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to connect to server');
      }
      set({
        connection: null,
        isConnected: false,
        isConnecting: false,
        error: error instanceof Error ? error : new Error('Connection failed'),
      });
      return null;
    }
  },

  disconnect: () => {
    const state = get();
    if (state.connection) {
      state.connection.close();
    }
    set({
      connection: null,
      isConnected: false,
      error: null,
    });
  },
}));
