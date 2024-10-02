import type { Streamable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import { BlocksSubject } from './subjects';

export class StreamedBlock implements Streamable {
  data: string;
  NAME = 'blocks';
  WILDCARD_LIST: string[] = [BlocksSubject.WILDCARD];

  constructor(data: string) {
    this.data = data;
  }

  async encode(): Promise<Uint8Array> {
    const encoder = new StreamEncoder(this);
    return encoder.encode(this.NAME);
  }

  static async decode(encoded: Uint8Array): Promise<StreamData<StreamedBlock>> {
    const encoder = new StreamEncoder(StreamedBlock);
    return encoder.decode<StreamedBlock>(encoded);
  }
}
