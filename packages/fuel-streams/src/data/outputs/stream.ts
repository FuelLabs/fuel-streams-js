import type { Output } from 'fuels';
import type { Client } from '../../client/natsClient';
import { StreamNames } from '../../constants';
import { BaseStreameable, Stream, StreamFactory } from '../../streams/stream';
import { OutputsWildcard } from './subjects';

/**
 * Represents a streamed output in the Fuel network.
 * @extends {BaseStreameable<Output, typeof OutputsWildcard>}
 *
 * @remarks
 * This class extends {@link BaseStreameable} with {@link Output} as the payload type
 * and {@link OutputsWildcard} as the wildcard type.
 *
 * @see {@link Output}
 * @see {@link OutputsWildcard}
 */
class StreamedOutput extends BaseStreameable<Output, typeof OutputsWildcard> {
  /**
   * Creates a new StreamedOutput instance.
   * @param {Output} payload - The output data to be streamed.
   *
   * @example
   * ```typescript
   * const output = new StreamedOutput(outputData);
   * ```
   */
  constructor(payload: Output) {
    super(payload, StreamNames.Outputs, OutputsWildcard);
  }
}

/**
 * Provides functionality for initializing and managing output streams.
 *
 * @remarks
 * This class provides static methods to initialize and manage output streams.
 */
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class OutputStream {
  /**
   * Initializes a new output stream.
   * @param {Client} client - The NATS client used for streaming.
   * @returns A promise that resolves to the initialized output stream.
   *
   * @example
   * ```typescript
   * const client = new Client();
   * const outputStream = await OutputStream.init(client);
   * ```
   *
   * @see {@link Client}
   * @see {@link Stream}
   * @see {@link StreamedOutput}
   */
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedOutput>(StreamNames.Outputs);
    return stream.init(client);
  }
}
