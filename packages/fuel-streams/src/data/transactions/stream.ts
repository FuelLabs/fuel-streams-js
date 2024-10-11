import type { Transaction } from 'fuels';
import type { Client } from '../../client/natsClient';
import { StreamNames } from '../../constants';
import { BaseStreameable, Stream, StreamFactory } from '../../streams/stream';
import { TransactionsWildcard } from './subjects';

/**
 * Represents a streamed transaction in the Fuel network.
 * @extends {BaseStreameable<Transaction, typeof TransactionsWildcard>}
 *
 * @remarks
 * This class extends {@link BaseStreameable} with {@link Transaction} as the payload type
 * and {@link TransactionsWildcard} as the wildcard type.
 *
 * @see {@link Transaction}
 * @see {@link TransactionsWildcard}
 */
class StreamedTransaction extends BaseStreameable<
  Transaction,
  typeof TransactionsWildcard
> {
  /**
   * Creates a new StreamedTransaction instance.
   * @param {Transaction} payload - The transaction data to be streamed.
   *
   * @example
   * ```typescript
   * const transaction = new StreamedTransaction(transactionData);
   * ```
   */
  constructor(payload: Transaction) {
    super(payload, StreamNames.Transactions, TransactionsWildcard);
  }
}

/**
 * Provides functionality for initializing and managing transaction streams.
 *
 * @remarks
 * This class provides static methods to initialize and manage transaction streams.
 */
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TransactionStream {
  /**
   * Initializes a new transaction stream.
   * @param {Client} client - The NATS client used for streaming.
   * @returns A promise that resolves to the initialized transaction stream.
   *
   * @example
   * ```typescript
   * const client = new Client();
   * const transactionStream = await TransactionStream.init(client);
   * ```
   *
   * @see {@link Client}
   * @see {@link Stream}
   * @see {@link StreamedTransaction}
   */
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedTransaction>(
      StreamNames.Transactions,
    );
    return stream.init(client);
  }
}
