import { BlocksStream } from 'src/modules/blocks';
import { Client } from 'src/nats-client';
import type { Stream } from 'src/stream';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Stream class
vi.mock('src/stream', () => ({
  Stream: {
    get: vi.fn().mockImplementation(async (_, bucketName) => {
      return {
        getStreamName: vi.fn().mockResolvedValue(`fuel_${bucketName}`),
      };
    }),
  },
}));

// Mock the Client class
vi.mock('src/nats-client', () => ({
  Client: {
    connect: vi.fn().mockResolvedValue({
      closeSafely: vi.fn().mockResolvedValue(undefined),
      getOrCreateKvStore: vi.fn().mockResolvedValue({}),
      opts: {
        getNamespace: vi.fn().mockReturnValue({
          streamName: vi.fn().mockImplementation((name) => `fuel_${name}`),
        }),
      },
    }),
  },
}));

describe('BlockStream', () => {
  let client: Client;
  let stream: Stream;

  beforeEach(async () => {
    client = await Client.connect({ network: 'testnet' });
    stream = await BlocksStream.init(client);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize a new block stream', async () => {
    expect(await stream.getStreamName()).toBe('fuel_blocks');
  });
});
