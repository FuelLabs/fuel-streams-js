import { DataParser } from '../parser/dataParser';
import { StreamData } from './streamData';

export class StreamEncoder<T> {
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

  public static decode<T>(encoded: Uint8Array): StreamData<T> {
    return DataParser.default().decode<StreamData<T>>(encoded);
  }
}
