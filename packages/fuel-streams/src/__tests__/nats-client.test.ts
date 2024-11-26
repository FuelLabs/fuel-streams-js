import { Network } from 'src/client-opts';
import { Client, ClientStatus } from 'src/nats-client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the wsconnect function
vi.mock('@nats-io/transport-node', () => ({
  wsconnect: vi.fn().mockImplementation(() => ({
    isClosed: () => false,
    getServer: () => 'test-server',
    closed: () => Promise.resolve(),
    close: () => Promise.resolve(),
    status: () => ({
      [Symbol.asyncIterator]: async function* () {
        yield { type: 'connect' };
      },
    }),
  })),
}));

// Mock the Kvm class
vi.mock('@nats-io/kv', () => ({
  Kvm: class {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    js: { jetstreamManager: () => any };
    constructor() {
      this.js = {
        jetstreamManager: () => ({
          jetstream: () => ({}),
        }),
      };
    }
    create() {
      return Promise.resolve({});
    }
  },
}));

describe('Client', () => {
  afterEach(() => {
    vi.clearAllMocks();
    // Reset the singleton instance
    // @ts-ignore - accessing private static field for testing
    Client.instance = undefined;
  });

  describe('connect', () => {
    it('should connect with default mainnet network', async () => {
      const client = await Client.connect();
      expect(client).toBeDefined();
      expect(client.opts?.getNetwork()).toBe(Network.mainnet);
    });

    it('should connect with specified network', async () => {
      const client = await Client.connect({ network: 'testnet' });
      expect(client).toBeDefined();
      expect(client.opts?.getNetwork()).toBe(Network.testnet);
    });

    it('should reuse existing instance on subsequent calls', async () => {
      const client1 = await Client.connect();
      const client2 = await Client.connect();
      expect(client1).toBe(client2);
    });
  });

  describe('getInstance', () => {
    it('should throw error if client not initialized', () => {
      expect(() => Client.getInstance()).toThrow('Client not initialized');
    });

    it('should return instance after initialization', async () => {
      const client = await Client.connect();
      expect(Client.getInstance()).toBe(client);
    });
  });

  describe('switchNetwork', () => {
    let client: Client;

    beforeEach(async () => {
      client = await Client.connect();
    });

    it('should switch network and create new connection', async () => {
      const newClient = await client.switchNetwork('testnet');
      expect(newClient.opts?.getNetwork()).toBe(Network.testnet);
    });

    it('should close existing connection before switching', async () => {
      const closeSpy = vi.spyOn(client, 'closeSafely');
      await client.switchNetwork('testnet');
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('getOrCreateKvStore', () => {
    let client: Client;

    beforeEach(async () => {
      client = await Client.connect();
    });

    it('should create kv store with given name', async () => {
      const store = await client.getOrCreateKvStore('test-store');
      expect(store).toBeDefined();
    });

    it('should accept optional options', async () => {
      const store = await client.getOrCreateKvStore('test-store', {
        history: 10,
      });
      expect(store).toBeDefined();
    });
  });

  describe('status monitoring', () => {
    let client: Client;

    beforeEach(async () => {
      client = await Client.connect();
    });

    it('should handle status updates', async () => {
      const statusCallback = vi.fn();
      const cleanup = client.getStatusStream(statusCallback);

      // Wait for initial status update
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(statusCallback).toHaveBeenCalledWith(ClientStatus.Connected);
      cleanup();
    });

    it('should throw error if connection not initialized', async () => {
      // @ts-ignore - accessing private field for testing
      client.natsConnection = undefined;
      expect(() => client.getStatusStream(() => {})).toThrow(
        'Cannot get status stream: NATS connection not initialized',
      );
    });
  });

  describe('connection management', () => {
    let client: Client;

    beforeEach(async () => {
      client = await Client.connect();
    });

    it('should check if connection is closing', () => {
      expect(client.isConnectionClosing()).toBe(false);
    });

    it('should close connection safely', async () => {
      await expect(client.closeSafely()).resolves.not.toThrow();
    });

    it('should handle close errors gracefully', async () => {
      const error = new Error('Close error');
      const mockConnection = {
        isClosed: () => false,
        closed: () => {
          const promise = Promise.reject(error);
          // Prevent unhandled rejection
          promise.catch(() => {});
          return promise;
        },
        close: () => {
          const promise = Promise.reject(error);
          // Prevent unhandled rejection
          promise.catch(() => {});
          return promise;
        },
      };

      // @ts-ignore - accessing private field for testing
      client.natsConnection = mockConnection;

      await expect(client.closeSafely()).rejects.toThrow('Close error');
    });
  });

  describe('getters', () => {
    let client: Client;

    beforeEach(async () => {
      client = await Client.connect();
    });

    it('should get NATS connection', () => {
      expect(client.getNatsConnection()).toBeDefined();
    });

    it('should get jetstream', () => {
      expect(client.getJetstream()).toBeDefined();
    });

    it('should get jetstream manager', () => {
      expect(client.getJetstreamManager()).toBeDefined();
    });

    it('should get client options', () => {
      expect(client.getClientOpts()).toBeDefined();
      expect(client.getClientOpts().getNetwork()).toBe(Network.mainnet);
    });

    it('should throw error if client options not set', () => {
      // @ts-ignore - accessing private field for testing
      client.opts = undefined;
      expect(() => client.getClientOpts()).toThrow(
        'Client options are not set',
      );
    });
  });
});
