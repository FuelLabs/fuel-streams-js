import type { Streamable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import { LogsSubject } from './subjects';

export class StreamedLog implements Streamable {
  data: string;
  NAME = 'logs';
  WILDCARD_LIST: string[] = [LogsSubject.WILDCARD];

  constructor(data: string) {
    this.data = data;
  }

  async encode(): Promise<Uint8Array> {
    const encoder = new StreamEncoder(this);
    return encoder.encode(this.NAME);
  }

  static async decode(encoded: Uint8Array): Promise<StreamData<StreamedLog>> {
    const encoder = new StreamEncoder(StreamedLog);
    return encoder.decode<StreamedLog>(encoded);
  }
}
