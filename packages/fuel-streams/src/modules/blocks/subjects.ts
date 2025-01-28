/**
 * This file is auto-generated by scripts/generate-subjects.ts
 * Do not edit this file manually
 *
 * Generated Subjects:
 * - BlocksSubject
 */

import { BlockParser } from '../../parsers';
import type { Address, Block, BlockHeight, RawBlock } from '../../types';
import { SubjectBase } from '../subject-base';

type BlocksFields = {
  height: BlockHeight;
  producer: Address;
};

export class BlocksSubject extends SubjectBase<BlocksFields, Block, RawBlock> {
  metadata = {
    id: 'blocks',
    format: 'blocks.{producer}.{height}',
    parser: new BlockParser(),
  };
}
