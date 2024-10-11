import type { BlockHeight, Bytes32 } from '..';
import { SubjectBase } from '../subject';

export enum LogsWildcard {
  All = 'logs.>',
}

interface LogsFields {
  blockHeight: BlockHeight;
  txId: Bytes32;
  receiptIndex: number;
  logId: Bytes32;
}

export class LogsSubject extends SubjectBase<LogsFields> {
  parse() {
    const { blockHeight, txId, receiptIndex, logId } = this.fields;
    return `logs.${blockHeight ?? '*'}.${txId ?? '*'}.${receiptIndex ?? '*'}.${
      logId ?? '*'
    }` as const;
  }

  withBlockHeight(blockHeight: BlockHeight | null) {
    return this.with('blockHeight', blockHeight);
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withReceiptIndex(receiptIndex: number | null) {
    return this.with('receiptIndex', receiptIndex);
  }

  withLogId(logId: Bytes32 | null) {
    return this.with('logId', logId);
  }
}
