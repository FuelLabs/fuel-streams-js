import type { ReceiptLog } from 'fuels';
import { Streameable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import { LogsSubject } from './subjects';

export class StreamedLog extends Streameable<ReceiptLog> {
  NAME = 'logs';
  WILDCARD_LIST: string[] = [LogsSubject.WILDCARD];

  constructor(public payload: ReceiptLog) {
    super();
  }

  async encode(): Promise<Uint8Array> {
    const encoder = new StreamEncoder(this.payload);
    return encoder.encode(this.NAME);
  }

  async decode(encoded: Uint8Array): Promise<StreamData<ReceiptLog>> {
    return StreamEncoder.decode(encoded);
  }
}
