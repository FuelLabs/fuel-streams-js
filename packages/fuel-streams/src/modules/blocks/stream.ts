import type { Client } from '../../nats-client';
import { BlockParser } from '../../parsers';
import { Stream } from '../../stream';
import { type Block, type RawBlock, StreamNames } from '../../types';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class BlocksStream {
  static async init(client: Client) {
    const parser = new BlockParser();
    return Stream.get<Block, RawBlock>(client, StreamNames.Blocks, parser);
  }
}
