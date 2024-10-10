import type { Input } from 'fuels';
import { StreamNames } from '../../constants';
import { Streameable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import { InputsWildcard } from './subjects';

export class StreamedInput extends Streameable<Input> {
  constructor(public payload: Input) {
    super();
  }

  name() {
    return StreamNames.Inputs;
  }

  queryAll() {
    return InputsWildcard.All;
  }

  wildcards() {
    return Object.values(InputsWildcard);
  }

  async encode() {
    const encoder = new StreamEncoder(this.payload);
    return encoder.encode(this.name());
  }

  async decode(encoded: Uint8Array): Promise<StreamData<Input>> {
    return StreamEncoder.decode(encoded);
  }
}
