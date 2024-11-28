import type { Client } from '../../nats-client';
import { OutputParser } from '../../parsers';
import { Stream } from '../../stream';
import { type Output, type RawOutput, StreamNames } from '../../types';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class OutputsStream {
  static async init(client: Client) {
    const parser = new OutputParser();
    return Stream.get<Output, RawOutput>(client, StreamNames.Outputs, parser);
  }
}
