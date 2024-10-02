import type { Streamable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import { TransactionsByIdSubject, TransactionsSubject } from './subjects';

export class StreamedTransaction implements Streamable {
  data: string;
  NAME = 'transactions';
  WILDCARD_LIST: string[] = [
    TransactionsByIdSubject.WILDCARD,
    TransactionsSubject.WILDCARD,
  ];

  constructor(data: string) {
    this.data = data;
  }

  async encode(): Promise<Uint8Array> {
    const encoder = new StreamEncoder(this);
    return encoder.encode(this.NAME);
  }

  static async decode(
    encoded: Uint8Array,
  ): Promise<StreamData<StreamedTransaction>> {
    const encoder = new StreamEncoder(StreamedTransaction);
    return encoder.decode<StreamedTransaction>(encoded);
  }
}
