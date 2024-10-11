import type { Input } from 'fuels';
import type { Client } from '../../client/natsClient';
import { StreamNames } from '../../constants';
import { BaseStreameable, StreamFactory } from '../../streams/stream';
import { InputsWildcard } from './subjects';

class StreamedInput extends BaseStreameable<Input, typeof InputsWildcard> {
  constructor(payload: Input) {
    super(payload, StreamNames.Inputs, InputsWildcard);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class InputStream {
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedInput>(StreamNames.Inputs);
    return stream.init(client);
  }
}
