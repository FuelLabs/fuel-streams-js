import { DataParser } from '../parser/dataParser';
import { StreamData } from './streamData';

export interface IStreamEncoder<T> {
  encode(subject: string, payload: T): Uint8Array;
  decode(encoded: Uint8Array): StreamData<T>;
}

export class StreamEncoder<T> implements IStreamEncoder<T> {
  private payload: T;
  private dataParser: DataParser;

  constructor(payload: T) {
    this.payload = payload;
    this.dataParser = StreamEncoder.defaultDataParser();
  }

  static defaultDataParser(): DataParser {
    return DataParser.default();
  }

  public encode(subject: string): Uint8Array {
    const data = new StreamData(subject, this.payload);
    return this.dataParser.encode(data);
  }

  public decode<T>(encoded: Uint8Array): StreamData<T> {
    return this.dataParser.decode<StreamData<T>>(encoded);
  }

  // public decodeRaw<T>(
  //   encoded: Uint8Array,
  // ): StreamData<T> {
  //   return this.dataParser.decode<StreamData<T>>(encoded);
  // }
}
