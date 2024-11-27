import type { Client } from '../../nats-client';
import { UtxoParser } from '../../parsers';
import { Stream } from '../../stream';
import { StreamNames, type Utxo } from '../../types';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class UtxosStream {
  static async init(client: Client) {
    const parser = new UtxoParser();
    return Stream.get<Utxo>(client, StreamNames.Utxos, parser);
  }
}
