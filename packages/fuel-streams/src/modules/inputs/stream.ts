import type { Client } from '../../nats-client';
import { InputParser } from '../../parsers';
import { Stream } from '../../stream';
import { type Input, type RawInput, StreamNames } from '../../types';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class InputsStream {
  static async init(client: Client) {
    const parser = new InputParser();
    return Stream.get<Input, RawInput>(client, StreamNames.Inputs, parser);
  }
}
