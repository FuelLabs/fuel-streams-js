import type { Output } from 'fuels';
import { StreamNames } from '../../constants';
import { Streameable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import { OutputsWildcard } from './subjects';

export class StreamedOutput extends Streameable<Output> {
  constructor(public payload: Output) {
    super();
  }

  name() {
    return StreamNames.Outputs;
  }

  queryAll() {
    return OutputsWildcard.All;
  }

  wildcards() {
    return Object.values(OutputsWildcard);
  }

  async encode() {
    const encoder = new StreamEncoder(this.payload);
    return encoder.encode(this.name());
  }

  async decode(encoded: Uint8Array): Promise<StreamData<Output>> {
    return StreamEncoder.decode(encoded);
  }
}
