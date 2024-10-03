import type { Receipt } from 'fuels';
import { Streameable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import {
  ReceiptsByIdSubject,
  ReceiptsCallSubject,
  ReceiptsReturnSubject,
  ReceiptsTransferSubject,
} from './subjects';

export class StreamedReceipt extends Streameable<Receipt> {
  NAME = 'receipts';
  WILDCARD_LIST: string[] = [
    ReceiptsByIdSubject.WILDCARD,
    ReceiptsCallSubject.WILDCARD,
    ReceiptsReturnSubject.WILDCARD,
    ReceiptsTransferSubject.WILDCARD,
  ];

  constructor(public payload: Receipt) {
    super();
  }

  async encode(): Promise<Uint8Array> {
    const encoder = new StreamEncoder(this.payload);
    return encoder.encode(this.NAME);
  }

  async decode(encoded: Uint8Array): Promise<StreamData<Receipt>> {
    return StreamEncoder.decode(encoded);
  }
}
