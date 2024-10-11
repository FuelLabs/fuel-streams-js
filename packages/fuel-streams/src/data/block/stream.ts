import type { Block } from 'fuels';
import type { Client } from '../../client/natsClient';
import { StreamNames } from '../../constants';
import { BaseStreameable, StreamFactory } from '../../streams/stream';
import { BlocksWildcard } from './subjects';

class StreamedBlock extends BaseStreameable<Block, typeof BlocksWildcard> {
  constructor(payload: Block) {
    super(payload, StreamNames.Blocks, BlocksWildcard);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class BlockStream {
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedBlock>(StreamNames.Blocks);
    return stream.init(client);
  }
}
