import type { Output } from 'fuels';
import type { Client } from '../../client/natsClient';
import { StreamNames } from '../../constants';
import { BaseStreameable, StreamFactory } from '../../streams/stream';
import { OutputsWildcard } from './subjects';

class StreamedOutput extends BaseStreameable<Output, typeof OutputsWildcard> {
  constructor(payload: Output) {
    super(payload, StreamNames.Outputs, OutputsWildcard);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class OutputStream {
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedOutput>(StreamNames.Outputs);
    return stream.init(client);
  }
}
