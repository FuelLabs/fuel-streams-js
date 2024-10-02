import type { Streamable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import {
  ReceiptsByIdSubject,
  ReceiptsCallSubject,
  ReceiptsReturnSubject,
  ReceiptsTransferSubject,
} from './subjects';

export class StreamedReceipt implements Streamable {
  data: string;
  NAME = 'receipts';
  WILDCARD_LIST: string[] = [
    ReceiptsByIdSubject.WILDCARD,
    ReceiptsCallSubject.WILDCARD,
    ReceiptsReturnSubject.WILDCARD,
    ReceiptsTransferSubject.WILDCARD,
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
  ): Promise<StreamData<StreamedReceipt>> {
    const encoder = new StreamEncoder(StreamedReceipt);
    return encoder.decode<StreamedReceipt>(encoded);
  }
}
