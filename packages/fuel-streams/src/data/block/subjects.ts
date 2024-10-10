import type { Block as FuelBlock } from 'fuels';
import type { Subject } from '..';

export enum BlocksWildcard {
  All = 'blocks.>',
}

export class BlocksSubject implements Subject {
  producer: string | null;
  height: number | null;

  constructor(producer: string | null = null, height: number | null = null) {
    this.producer = producer;
    this.height = height;
  }

  withProducer(producer: string | null) {
    this.producer = producer;
    return this;
  }

  withHeight(height: number | null) {
    this.height = height;
    return this;
  }

  parse() {
    return `blocks.${this.producer ?? '*'}.${this.height ?? '*'}` as const;
  }

  static wildcard(
    producer: string | null = null,
    height: number | null = null,
  ) {
    return `blocks.${producer ?? '*'}.${height ?? '*'}` as const;
  }

  static fromFuelBlock(block: FuelBlock) {
    const blockHeight = block.header.daHeight.toNumber();
    return new BlocksSubject(null, blockHeight);
  }
}
