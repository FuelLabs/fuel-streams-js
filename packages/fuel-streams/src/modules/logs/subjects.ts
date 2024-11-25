/**
 * This file is auto-generated by scripts/generate-subjects.ts
 * Do not edit this file manually
 *
 * Generated Subjects:
 * - LogsSubject
 */

import type { BlockHeight, Bytes32 } from '../../types';
import { SubjectBase } from '../subject-base';
type LogsFields = {
  blockHeight: BlockHeight;
  txId: Bytes32;
  receiptIndex: number;
  logId: Bytes32;
};

export class LogsSubject extends SubjectBase<LogsFields> {
  protected format = 'logs.{block_height}.{tx_id}.{receipt_index}.{log_id}';
}
