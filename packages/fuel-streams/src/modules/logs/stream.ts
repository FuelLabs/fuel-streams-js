import type { Client } from '../../nats-client';
import { LogParser } from '../../parsers';
import { Stream } from '../../stream';
import { type Log, type RawLog, StreamNames } from '../../types';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class LogsStream {
  static async init(client: Client) {
    const parser = new LogParser();
    return Stream.get<Log, RawLog>(client, StreamNames.Logs, parser);
  }
}
