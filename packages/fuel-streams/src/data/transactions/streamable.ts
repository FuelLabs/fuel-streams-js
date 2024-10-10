import type { Transaction } from 'fuels';
import { StreamNames } from '../../constants';
import { Streameable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import { TransactionsWildcard } from './subjects';

export class StreamedTransaction extends Streameable<Transaction> {
  constructor(public payload: Transaction) {
    super();
  }

  name(): string {
    return StreamNames.Transactions;
  }

  queryAll() {
    return TransactionsWildcard.All;
  }

  wildcards() {
    return Object.values(TransactionsWildcard);
  }

  async encode() {
    const encoder = new StreamEncoder(this.payload);
    return encoder.encode(this.name());
  }

  async decode(encoded: Uint8Array): Promise<StreamData<Transaction>> {
    return StreamEncoder.decode(encoded);
  }
}
