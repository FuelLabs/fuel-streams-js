import type { Client } from '../../nats-client';
import { BaseStreameable, StreamFactory } from '../../stream';
import { type Block, StreamNames } from '../../types';
import { BlocksWildcard } from './subjects';

class StreamedBlocks extends BaseStreameable<Block, typeof BlocksWildcard> {
  constructor(payload: Block) {
    super(payload, StreamNames.Blocks, BlocksWildcard);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class BlocksStream {
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedBlocks>(StreamNames.Blocks);
    return stream.init(client);
  }
}
