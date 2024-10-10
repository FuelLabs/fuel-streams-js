import type { Input } from 'fuels';
import { Streameable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import {
  InputsCoinSubject,
  InputsContractSubject,
  InputsMessageSubject,
} from './subjects';

export class StreamedInput extends Streameable<Input> {
  NAME = 'inputs';
  WILDCARD_LIST: string[] = [
    InputsCoinSubject.WILDCARD,
    InputsContractSubject.WILDCARD,
    InputsMessageSubject.WILDCARD,
  ];

  constructor(public payload: Input) {
    super();
  }

  async encode(): Promise<Uint8Array> {
    const encoder = new StreamEncoder(this.payload);
    return encoder.encode(this.NAME);
  }

  async decode(encoded: Uint8Array): Promise<StreamData<Input>> {
    return StreamEncoder.decode(encoded);
  }
}
