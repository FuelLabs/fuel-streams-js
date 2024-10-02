import type { Streamable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import {
  InputsCoinSubject,
  InputsContractSubject,
  InputsMessageSubject,
} from './subjects';

export class StreamedInput implements Streamable {
  data: string;
  NAME = 'inputs';
  WILDCARD_LIST: string[] = [
    InputsCoinSubject.WILDCARD,
    InputsContractSubject.WILDCARD,
    InputsMessageSubject.WILDCARD,
  ];

  constructor(data: string) {
    this.data = data;
  }

  async encode(): Promise<Uint8Array> {
    const encoder = new StreamEncoder(this);
    return encoder.encode(this.NAME);
  }

  static async decode(encoded: Uint8Array): Promise<StreamData<StreamedInput>> {
    const encoder = new StreamEncoder(StreamedInput);
    return encoder.decode<StreamedInput>(encoded);
  }
}
