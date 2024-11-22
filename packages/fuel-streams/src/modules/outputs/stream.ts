import type { Client } from '../../nats-client';
import { BaseStreameable, StreamFactory } from '../../stream';
import { type Output, StreamNames } from '../../types';
import { OutputsWildcard } from './subjects';

class StreamedOutputs extends BaseStreameable<Output, typeof OutputsWildcard> {
  constructor(payload: Output) {
    super(payload, StreamNames.Outputs, OutputsWildcard);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class OutputsStream {
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedOutputs>(StreamNames.Outputs);
    return stream.init(client);
  }
}
