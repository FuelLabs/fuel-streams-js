import type { Streamable } from '../../streams/stream';
import type { StreamData } from '../../streams/streamData';
import { StreamEncoder } from '../../streams/streamEncoder';
import {
  OutputsByIdSubject,
  OutputsChangeSubject,
  OutputsCoinSubject,
  OutputsContractCreatedSubject,
  OutputsContractSubject,
  OutputsVariableSubject,
} from './subjects';

export class StreamedOutput implements Streamable {
  data: string;
  NAME = 'outputs';
  WILDCARD_LIST: string[] = [
    OutputsByIdSubject.WILDCARD,
    OutputsChangeSubject.WILDCARD,
    OutputsCoinSubject.WILDCARD,
    OutputsContractCreatedSubject.WILDCARD,
    OutputsContractSubject.WILDCARD,
    OutputsVariableSubject.WILDCARD,
  ];

  constructor(data: string) {
    this.data = data;
  }

  async encode(): Promise<Uint8Array> {
    const encoder = new StreamEncoder(this);
    return encoder.encode(this.NAME);
  }

  static async decode(
    encoded: Uint8Array,
  ): Promise<StreamData<StreamedOutput>> {
    const encoder = new StreamEncoder(StreamedOutput);
    return encoder.decode<StreamedOutput>(encoded);
  }
}
