import type { Receipt } from 'fuels';
import type { Client } from '../../client/natsClient';
import { StreamNames } from '../../constants';
import { BaseStreameable, Stream, StreamFactory } from '../../streams/stream';
import { ReceiptsWildcard } from './subjects';

/**
 * Represents a streamed receipt in the Fuel network.
 * @extends {BaseStreameable<Receipt, typeof ReceiptsWildcard>}
 *
 * @remarks
 * This class extends {@link BaseStreameable} with {@link Receipt} as the payload type
 * and {@link ReceiptsWildcard} as the wildcard type.
 *
 * @see {@link Receipt}
 * @see {@link ReceiptsWildcard}
 */
class StreamedReceipt extends BaseStreameable<
  Receipt,
  typeof ReceiptsWildcard
> {
  /**
   * Creates a new StreamedReceipt instance.
   * @param {Receipt} payload - The receipt data to be streamed.
   *
   * @example
   * ```typescript
   * const receipt = new StreamedReceipt(receiptData);
   * ```
   */
  constructor(payload: Receipt) {
    super(payload, StreamNames.Receipts, ReceiptsWildcard);
  }
}

/**
 * Provides functionality for initializing and managing receipt streams.
 *
 * @remarks
 * This class provides static methods to initialize and manage receipt streams.
 */
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ReceiptStream {
  /**
   * Initializes a new receipt stream.
   * @param {Client} client - The NATS client used for streaming.
   * @returns A promise that resolves to the initialized receipt stream.
   *
   * @example
   * ```typescript
   * const client = new Client();
   * const receiptStream = await ReceiptStream.init(client);
   * ```
   *
   * @see {@link Client}
   * @see {@link Stream}
   * @see {@link StreamedReceipt}
   */
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedReceipt>(StreamNames.Receipts);
    return stream.init(client);
  }
}
