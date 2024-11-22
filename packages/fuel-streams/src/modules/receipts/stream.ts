import type { Client } from '../../nats-client';
import { BaseStreameable, StreamFactory } from '../../stream';
import { type Receipt, StreamNames } from '../../types';
import { ReceiptsWildcard } from './subjects';

class StreamedReceipts extends BaseStreameable<
  Receipt,
  typeof ReceiptsWildcard
> {
  constructor(payload: Receipt) {
    super(payload, StreamNames.Receipts, ReceiptsWildcard);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ReceiptsStream {
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedReceipts>(StreamNames.Receipts);
    return stream.init(client);
  }
}
