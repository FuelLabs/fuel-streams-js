import type { Input } from 'fuels';
import type { Client } from '../../client/natsClient';
import { StreamNames } from '../../constants';
import { BaseStreameable, Stream, StreamFactory } from '../../streams/stream';
import { InputsWildcard } from './subjects';

/**
 * Represents a streamed input in the Fuel network.
 * @extends {BaseStreameable<Input, typeof InputsWildcard>}
 *
 * @remarks
 * This class extends {@link BaseStreameable} with {@link Input} as the payload type
 * and {@link InputsWildcard} as the wildcard type.
 *
 * @see {@link Input}
 * @see {@link InputsWildcard}
 */
class StreamedInput extends BaseStreameable<Input, typeof InputsWildcard> {
  /**
   * Creates a new StreamedInput instance.
   * @param {Input} payload - The input data to be streamed.
   *
   * @example
   * ```typescript
   * const input = new StreamedInput(inputData);
   * ```
   */
  constructor(payload: Input) {
    super(payload, StreamNames.Inputs, InputsWildcard);
  }
}

/**
 * Provides functionality for initializing and managing input streams.
 *
 * @remarks
 * This class provides static methods to initialize and manage input streams.
 */
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class InputStream {
  /**
   * Initializes a new input stream.
   * @param {Client} client - The NATS client used for streaming.
   * @returns {Promise<Stream<StreamedInput>>} A promise that resolves to the initialized input stream.
   *
   * @example
   * ```typescript
   * const client = new Client();
   * const inputStream = await InputStream.init(client);
   * ```
   *
   * @see {@link Client}
   * @see {@link Stream}
   * @see {@link StreamedInput}
   */
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedInput>(StreamNames.Inputs);
    return stream.init(client);
  }
}
