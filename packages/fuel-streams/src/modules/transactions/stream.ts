import type { Client } from '../../nats-client';
import { BaseStreameable, StreamFactory } from '../../stream';
import { StreamNames, type Transaction } from '../../types';
import { TransactionsWildcard } from './subjects';

class StreamedTransactions extends BaseStreameable<
  Transaction,
  typeof TransactionsWildcard
> {
  constructor(payload: Transaction) {
    super(payload, StreamNames.Transactions, TransactionsWildcard);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TransactionsStream {
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedTransactions>(
      StreamNames.Transactions,
    );
    return stream.init(client);
  }
}
