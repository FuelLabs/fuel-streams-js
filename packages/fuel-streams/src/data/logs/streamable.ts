import type { ReceiptLog } from 'fuels';
import { StreamNames } from '../../constants';
import { Streameable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import { LogsWildcard } from './subjects';

export class StreamedLog extends Streameable<ReceiptLog> {
  constructor(public payload: ReceiptLog) {
    super();
  }

  name(): string {
    return StreamNames.Logs;
  }

  queryAll() {
    return LogsWildcard.All;
  }

  wildcards() {
    return Object.values(LogsWildcard);
  }

  async encode() {
    const encoder = new StreamEncoder(this.payload);
    return encoder.encode(this.name());
  }

  async decode(encoded: Uint8Array): Promise<StreamData<ReceiptLog>> {
    return StreamEncoder.decode(encoded);
  }
}
