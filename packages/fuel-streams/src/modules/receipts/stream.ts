import type { Client } from '../../nats-client';
import { Stream } from '../../stream';
import { StreamNames } from '../../types';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ReceiptsStream {
  static async init(client: Client) {
    return Stream.get(client, StreamNames.Receipts);
  }
}
