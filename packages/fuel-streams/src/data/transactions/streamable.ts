import type { Transaction } from 'fuels';
import { Streameable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import { TransactionsByIdSubject, TransactionsSubject } from './subjects';

export class StreamedTransaction extends Streameable<Transaction> {
  NAME = 'transactions';
  WILDCARD_LIST: string[] = [
    TransactionsByIdSubject.WILDCARD,
    TransactionsSubject.WILDCARD,
  ];

  constructor(public payload: Transaction) {
    super();
  }

  async encode(): Promise<Uint8Array> {
    const encoder = new StreamEncoder(this.payload);
    return encoder.encode(this.NAME);
  }

  async decode(encoded: Uint8Array): Promise<StreamData<Transaction>> {
    return StreamEncoder.decode(encoded);
  }
}
