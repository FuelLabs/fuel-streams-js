import type { Block as FuelBlock } from 'fuels';
import { SubjectBase } from '../subject';

export enum BlocksWildcard {
  All = 'blocks.>',
}

interface BlocksFields {
  producer: string;
  height: number;
}

export class BlocksSubject extends SubjectBase<BlocksFields> {
  parse() {
    const { producer, height } = this.fields;
    return `blocks.${producer ?? '*'}.${height ?? '*'}` as const;
  }

  static fromFuelBlock(block: FuelBlock) {
    const blockHeight = block.header.daHeight.toNumber();
    return new BlocksSubject().withHeight(blockHeight);
  }

  withProducer(producer: string | null) {
    return this.with('producer', producer);
  }

  withHeight(height: number | null) {
    return this.with('height', height);
  }
}
