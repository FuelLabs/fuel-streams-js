import type { Block } from 'fuels';
import { StreamNames } from '../../constants';
import { Streameable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import { BlocksWildcard } from './subjects';

export class StreamedBlock extends Streameable<Block> {
  constructor(public payload: Block) {
    super();
  }

  queryAll() {
    return BlocksWildcard.All;
  }

  wildcards() {
    return Object.values(BlocksWildcard);
  }

  name() {
    return StreamNames.Blocks;
  }

  async encode() {
    const encoder = new StreamEncoder(this.payload);
    return encoder.encode(this.name());
  }

  async decode(encoded: Uint8Array): Promise<StreamData<Block>> {
    return StreamEncoder.decode(encoded);
  }
}
