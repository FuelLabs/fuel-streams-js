import type { Client } from '../../nats-client';
import { ReceiptParser } from '../../parsers';
import { Stream } from '../../stream';
import { type RawReceipt, type Receipt, StreamNames } from '../../types';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ReceiptsStream {
  static async init(client: Client) {
    const parser = new ReceiptParser();
    return Stream.get<Receipt, RawReceipt>(
      client,
      StreamNames.Receipts,
      parser,
    );
  }
}
