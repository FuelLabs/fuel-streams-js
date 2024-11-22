import type { Client } from '../../nats-client';
import { BaseStreameable, StreamFactory } from '../../stream';
import { StreamNames, type Utxo } from '../../types';
import { UtxosWildcard } from './subjects';

class StreamedUtxos extends BaseStreameable<Utxo, typeof UtxosWildcard> {
  constructor(payload: Utxo) {
    super(payload, StreamNames.Utxos, UtxosWildcard);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class UtxosStream {
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedUtxos>(StreamNames.Utxos);
    return stream.init(client);
  }
}
