import type { Receipt } from 'fuels';
import type { Client } from '../../client/natsClient';
import { StreamNames } from '../../constants';
import { BaseStreameable, StreamFactory } from '../../streams/stream';
import { ReceiptsWildcard } from './subjects';

class StreamedReceipt extends BaseStreameable<
  Receipt,
  typeof ReceiptsWildcard
> {
  constructor(payload: Receipt) {
    super(payload, StreamNames.Receipts, ReceiptsWildcard);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ReceiptStream {
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedReceipt>(StreamNames.Receipts);
    return stream.init(client);
  }
}
