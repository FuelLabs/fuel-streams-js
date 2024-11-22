import { ClientOpts } from 'src/client-opts';
import { BlocksStream } from 'src/modules/blocks';
import { Client } from 'src/nats-client';
import type { Stream } from 'src/stream';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('BlockStream', () => {
  let client: Client;
  let stream: Stream;

  beforeAll(async () => {
    client = await Client.connect(new ClientOpts());
    stream = await BlocksStream.init(client);
  });

  afterAll(async () => {
    await client?.closeSafely();
  });

  it('should initialize a new block stream', async () => {
    expect(await stream.getStreamName()).toBe('fuel_blocks');
  });
});
