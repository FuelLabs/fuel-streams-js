import type { Receipt } from 'fuels';
import { StreamNames } from '../../constants';
import { Streameable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import { ReceiptsWildcard } from './subjects';

export class StreamedReceipt extends Streameable<Receipt> {
  constructor(public payload: Receipt) {
    super();
  }

  name(): string {
    return StreamNames.Receipts;
  }

  queryAll() {
    return ReceiptsWildcard.All;
  }

  wildcards() {
    return Object.values(ReceiptsWildcard);
  }

  async encode(): Promise<Uint8Array> {
    const encoder = new StreamEncoder(this.payload);
    return encoder.encode(this.name());
  }

  async decode(encoded: Uint8Array): Promise<StreamData<Receipt>> {
    return StreamEncoder.decode(encoded);
  }
}
