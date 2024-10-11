import type { Transaction } from 'fuels';
import type { Client } from '../../client/natsClient';
import { StreamNames } from '../../constants';
import { BaseStreameable, StreamFactory } from '../../streams/stream';
import { TransactionsWildcard } from './subjects';

class StreamedTransaction extends BaseStreameable<
  Transaction,
  typeof TransactionsWildcard
> {
  constructor(payload: Transaction) {
    super(payload, StreamNames.Transactions, TransactionsWildcard);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TransactionStream {
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedTransaction>(
      StreamNames.Transactions,
    );
    return stream.init(client);
  }
}
