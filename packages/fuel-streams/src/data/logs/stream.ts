import type { ReceiptLog } from 'fuels';
import type { Client } from '../../client/natsClient';
import { StreamNames } from '../../constants';
import { BaseStreameable, Stream, StreamFactory } from '../../streams/stream';
import { LogsWildcard } from './subjects';

/**
 * Represents a streamed log entry in the Fuel network.
 * @extends {BaseStreameable<ReceiptLog, typeof LogsWildcard>}
 *
 * @remarks
 * This class extends {@link BaseStreameable} with {@link ReceiptLog} as the payload type
 * and {@link LogsWildcard} as the wildcard type.
 *
 * @see {@link ReceiptLog}
 * @see {@link LogsWildcard}
 */
class StreamedLog extends BaseStreameable<ReceiptLog, typeof LogsWildcard> {
  /**
   * Creates a new StreamedLog instance.
   * @param {ReceiptLog} payload - The receipt log data to be streamed.
   *
   * @example
   * ```typescript
   * const log = new StreamedLog(logData);
   * ```
   */
  constructor(payload: ReceiptLog) {
    super(payload, StreamNames.Logs, LogsWildcard);
  }
}

/**
 * Provides functionality for initializing and managing log streams.
 *
 * @remarks
 * This class provides static methods to initialize and manage log streams.
 */
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class LogStream {
  /**
   * Initializes a new log stream.
   * @param {Client} client - The NATS client used for streaming.
   * @returns {Promise<Stream<StreamedLog>>} A promise that resolves to the initialized log stream.
   *
   * @example
   * ```typescript
   * const client = new Client();
   * const logStream = await LogStream.init(client);
   * ```
   *
   * @see {@link Client}
   * @see {@link Stream}
   * @see {@link StreamedLog}
   */
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedLog>(StreamNames.Logs);
    return stream.init(client);
  }
}
