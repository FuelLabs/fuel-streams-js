import type { Block as FuelBlock } from 'fuels';
import { SubjectBase } from '../../streams/subject';

/**
 * Enum representing wildcards for block subjects.
 * @enum {string}
 *
 * @example
 * // Using the All wildcard
 * const allBlocks = BlocksWildcard.All;
 * console.log(allBlocks); // 'blocks.>'
 */
export enum BlocksWildcard {
  /** Matches all block subjects */
  All = 'blocks.>',
}

/**
 * Interface defining the fields for a block subject.
 * @interface
 */
interface BlocksFields {
  /** The producer of the block */
  producer: string;
  /** The height of the block */
  height: number;
}

/**
 * Class representing a subject for blocks.
 * @extends {SubjectBase<BlocksFields>}
 *
 * @example
 * const subject = new BlocksSubject()
 *   .withProducer('0x1234...5678')
 *   .withHeight(100);
 * console.log(subject.parse()); // 'blocks.0x1234...5678.100'
 */
export class BlocksSubject extends SubjectBase<BlocksFields> {
  /**
   * Parses the fields into a subject string.
   * @returns The parsed subject string.
   */
  parse() {
    const { producer, height } = this.fields;
    return `blocks.${producer ?? '*'}.${height ?? '*'}` as const;
  }

  /**
   * Creates a {@link BlocksSubject} from a {@link FuelBlock}.
   * @param block - The Fuel block to create the subject from.
   * @returns A new {@link BlocksSubject} instance.
   */
  static fromFuelBlock(block: FuelBlock) {
    const blockHeight = block.header.daHeight.toNumber();
    return new BlocksSubject().withHeight(blockHeight);
  }

  /**
   * Sets the producer for the subject.
   * @param producer - The producer to set.
   * @returns The updated {@link BlocksSubject} instance.
   */
  withProducer(producer: string | null) {
    return this.with('producer', producer);
  }

  /**
   * Sets the height for the subject.
   * @param height - The height to set.
   * @returns The updated {@link BlocksSubject} instance.
   */
  withHeight(height: number | null) {
    return this.with('height', height);
  }
}
