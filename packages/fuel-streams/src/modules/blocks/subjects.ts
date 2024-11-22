/**
 * This file is auto-generated by scripts/generate-subjects.ts
 * Do not edit this file manually
 *
 * Generated Subjects:
 * - BlocksSubject
 */

import type { Address, BlockHeight } from '../../types';
import { SubjectBase } from '../subject-base';

export enum BlocksWildcard {
  All = 'blocks.>',
}

type BlocksFields = {
  producer: Address;
  height: BlockHeight;
};

export class BlocksSubject extends SubjectBase<BlocksFields> {
  protected format = 'blocks.{producer}.{height}';
}
