import type { Client } from '../../nats-client';
import { LogParser } from '../../parsers';
import { Stream } from '../../stream';
import { type Log, StreamNames } from '../../types';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class LogsStream {
  static async init(client: Client) {
    const parser = new LogParser();
    return Stream.get<Log>(client, StreamNames.Logs, parser);
  }
}
