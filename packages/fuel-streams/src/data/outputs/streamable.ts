import type { Output } from 'fuels';
import { Streameable } from '../../streams/stream';
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

export class StreamedOutput extends Streameable<Output> {
  NAME = 'outputs';
  WILDCARD_LIST: string[] = [
    OutputsByIdSubject.WILDCARD,
    OutputsChangeSubject.WILDCARD,
    OutputsCoinSubject.WILDCARD,
    OutputsContractCreatedSubject.WILDCARD,
    OutputsContractSubject.WILDCARD,
    OutputsVariableSubject.WILDCARD,
  ];

  constructor(public payload: Output) {
    super();
  }

  async encode(): Promise<Uint8Array> {
    const encoder = new StreamEncoder(this.payload);
    return encoder.encode(this.NAME);
  }

  async decode(encoded: Uint8Array): Promise<StreamData<Output>> {
    return StreamEncoder.decode(encoded);
  }
}
