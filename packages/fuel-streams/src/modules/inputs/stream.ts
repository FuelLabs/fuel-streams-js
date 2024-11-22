import type { Client } from '../../nats-client';
import { BaseStreameable, StreamFactory } from '../../stream';
import { type Input, StreamNames } from '../../types';
import { InputsWildcard } from './subjects';

class StreamedInputs extends BaseStreameable<Input, typeof InputsWildcard> {
  constructor(payload: Input) {
    super(payload, StreamNames.Inputs, InputsWildcard);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class InputsStream {
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedInputs>(StreamNames.Inputs);
    return stream.init(client);
  }
}
