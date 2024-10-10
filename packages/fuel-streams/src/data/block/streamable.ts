import type { Block } from 'fuels';
import { Streameable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import { BlocksSubject } from './subjects';

export class StreamedBlock extends Streameable<Block> {
  NAME = 'blocks';
  WILDCARD_LIST: string[] = [BlocksSubject.WILDCARD];

  constructor(public payload: Block) {
    super();
  }

  async encode(): Promise<Uint8Array> {
    const encoder = new StreamEncoder(this.payload);
    return encoder.encode(this.NAME);
  }

  async decode(encoded: Uint8Array): Promise<StreamData<Block>> {
    return StreamEncoder.decode(encoded);
  }
}
