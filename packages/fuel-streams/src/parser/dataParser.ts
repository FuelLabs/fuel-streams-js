import { type CompressionStrategy, defaultStrategy } from './strategies';

export interface DataParseable {
  serialize(): string;
  deserialize(data: string): DataParseable;
}

export enum SerializationType {
  Bincode = 'bincode',
  Postcard = 'postcard',
  Json = 'json',
}

export class DataParser {
  private compressionStrategy: CompressionStrategy;
  private serializationType: SerializationType;

  constructor(
    compressionStrategy: CompressionStrategy,
    serializationType: SerializationType,
  ) {
    this.compressionStrategy = compressionStrategy;
    this.serializationType = serializationType;
  }

  public static default(): DataParser {
    return new DataParser(defaultStrategy(), SerializationType.Json);
  }

  public withCompressionStrategy(strategy: CompressionStrategy): DataParser {
    this.compressionStrategy = strategy;
    return this;
  }

  public withSerializationType(type: SerializationType): DataParser {
    this.serializationType = type;
    return this;
  }

  public encode<T>(data: T): Uint8Array {
    const serializedData = this.serialize(data);
    return this.compressionStrategy.compress(serializedData);
  }

  private serialize<T>(data: T): Uint8Array {
    switch (this.serializationType) {
      case SerializationType.Bincode:
        throw new Error('Bincode serialization not supported');
      case SerializationType.Postcard:
        throw new Error('Postcard serialization not supported');
      case SerializationType.Json:
        return new TextEncoder().encode(JSON.stringify(data));
      default:
        throw new Error('Unsupported serialization type');
    }
  }

  public decode<T>(data: Uint8Array): T {
    const decompressedData = this.compressionStrategy.decompress(data);
    const deserializedData = this.deserialize<T>(decompressedData);
    return deserializedData;
  }

  private deserialize<T>(serializedData: Uint8Array): T {
    switch (this.serializationType) {
      case SerializationType.Bincode:
        throw new Error('Bincode deserialization not supported');
      case SerializationType.Postcard:
        throw new Error('Postcard deserialization not supported');
      case SerializationType.Json: {
        const json = new TextDecoder().decode(serializedData);
        const data = JSON.parse(json) as T;
        return data;
      }
      default:
        throw new Error('Unsupported deserialization type');
    }
  }
}
