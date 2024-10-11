import type { Block } from 'fuels';
import type { Client } from '../../client/natsClient';
import { StreamNames } from '../../constants';
import { BaseStreameable, Stream, StreamFactory } from '../../streams/stream';
import { BlocksWildcard } from './subjects';

/**
 * Represents a streamed block in the Fuel network.
 * @extends {BaseStreameable<Block, typeof BlocksWildcard>}
 *
 * @remarks
 * This class extends {@link BaseStreameable} with {@link Block} as the payload type
 * and {@link BlocksWildcard} as the wildcard type.
 *
 * @see {@link Block}
 * @see {@link BlocksWildcard}
 */
class StreamedBlock extends BaseStreameable<Block, typeof BlocksWildcard> {
  /**
   * Creates a new StreamedBlock instance.
   * @param {Block} payload - The block data to be streamed.
   *
   * @example
   * ```typescript
   * const block = new StreamedBlock(blockData);
   * ```
   */
  constructor(payload: Block) {
    super(payload, StreamNames.Blocks, BlocksWildcard);
  }
}

/**
 * Provides functionality for initializing and managing block streams.
 *
 * @remarks
 * This class provides static methods to initialize and manage block streams.
 */
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class BlockStream {
  /**
   * Initializes a new block stream.
   * @param {Client} client - The NATS client used for streaming.
   * @returns {Promise<Stream<StreamedBlock>>} A promise that resolves to the initialized block stream.
   *
   * @example
   * ```typescript
   * const client = new Client();
   * const blockStream = await BlockStream.init(client);
   * ```
   *
   * @see {@link Client}
   * @see {@link Stream}
   * @see {@link StreamedBlock}
   */
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedBlock>(StreamNames.Blocks);
    return stream.init(client);
  }
}
