const pako = require('pako');

export interface CompressionStrategy {
  name(): string;
  compress(uncompressed: Uint8Array): Uint8Array;
  decompress(compressed: Uint8Array): Uint8Array;
}

enum CompressionLevel {
  Fastest = 'fastest',
  Best = 'best',
  Default = 'default',
}

export class ZLibCompressionStrategy implements CompressionStrategy {
  private compressionLevel: CompressionLevel;

  constructor(compressionLevel = CompressionLevel.Fastest) {
    this.compressionLevel = compressionLevel;
  }

  name(): string {
    return 'ZLibCompressionStrategy';
  }

  compress(uncompressed: Uint8Array): Uint8Array {
    return pako.deflate(uncompressed);
  }

  decompress(compressed: Uint8Array): Uint8Array {
    return pako.inflate(compressed);
  }
}

export const defaultStrategy = () => new ZLibCompressionStrategy();
