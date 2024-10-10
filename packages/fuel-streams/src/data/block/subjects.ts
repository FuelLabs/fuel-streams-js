import type { Block as FuelBlock } from 'fuels';
import type { Subject } from '..';

export class BlocksSubject implements Subject {
  producer: string | null;
  height: number | null;

  constructor(producer: string | null = null, height: number | null = null) {
    this.producer = producer;
    this.height = height;
  }

  static WILDCARD = 'blocks.>';

  withProducer(producer: string | null): BlocksSubject {
    this.producer = producer;
    return this;
  }

  withHeight(height: number | null): BlocksSubject {
    this.height = height;
    return this;
  }

  parse(): string {
    const producerStr = this.producer ? this.producer : '*';
    const heightStr = this.height ? this.height.toString() : '*';
    return `blocks.${producerStr}.${heightStr}`;
  }

  static wildcard(
    producer: string | null = null,
    height: number | null = null,
  ): string {
    const producerStr = producer ? producer : '*';
    const heightStr = height ? height.toString() : '*';
    return `blocks.${producerStr}.${heightStr}`;
  }

  static fromFuelBlock(block: FuelBlock): BlocksSubject {
    const blockHeight = block.header.daHeight.toNumber();
    return new BlocksSubject(null, blockHeight);
  }
}
