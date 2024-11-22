import type { Client } from '../../nats-client';
import { BaseStreameable, StreamFactory } from '../../stream';
import { type Log, StreamNames } from '../../types';
import { LogsWildcard } from './subjects';

class StreamedLogs extends BaseStreameable<Log, typeof LogsWildcard> {
  constructor(payload: Log) {
    super(payload, StreamNames.Logs, LogsWildcard);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class LogsStream {
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedLogs>(StreamNames.Logs);
    return stream.init(client);
  }
}
