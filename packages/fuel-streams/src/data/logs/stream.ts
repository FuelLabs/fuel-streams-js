import type { ReceiptLog } from 'fuels';
import type { Client } from '../../client/natsClient';
import { StreamNames } from '../../constants';
import { BaseStreameable, StreamFactory } from '../../streams/stream';
import { LogsWildcard } from './subjects';

class StreamedLog extends BaseStreameable<ReceiptLog, typeof LogsWildcard> {
  constructor(payload: ReceiptLog) {
    super(payload, StreamNames.Logs, LogsWildcard);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class LogStream {
  static async init(client: Client) {
    const stream = StreamFactory.get<StreamedLog>(StreamNames.Logs);
    return stream.init(client);
  }
}
