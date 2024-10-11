import type { BlockHeight, Bytes32 } from '..';
import { SubjectBase } from '../../streams/subject';

/**
 * Enum representing wildcards for log subjects.
 * @enum {string}
 *
 * @example
 * // Using the All wildcard
 * const allLogs = LogsWildcard.All;
 * console.log(allLogs); // 'logs.>'
 */
export enum LogsWildcard {
  /** Matches all log subjects */
  All = 'logs.>',
}

/**
 * Interface defining the fields for a log subject.
 * @interface
 */
interface LogsFields {
  /** The block height */
  blockHeight: BlockHeight;
  /** The transaction ID */
  txId: Bytes32;
  /** The index of the receipt */
  receiptIndex: number;
  /** The log ID */
  logId: Bytes32;
}

/**
 * Class representing a subject for logs.
 * @extends {SubjectBase<LogsFields>}
 *
 * @example
 * const subject = new LogsSubject()
 *   .withBlockHeight(1000)
 *   .withTxId('0x1234...5678')
 *   .withReceiptIndex(2)
 *   .withLogId('0xabcd...ef01');
 * console.log(subject.parse()); // 'logs.1000.0x1234...5678.2.0xabcd...ef01'
 */
export class LogsSubject extends SubjectBase<LogsFields> {
  /**
   * Parses the fields into a subject string.
   * @returns The parsed subject string.
   */
  parse() {
    const { blockHeight, txId, receiptIndex, logId } = this.fields;
    return `logs.${blockHeight ?? '*'}.${txId ?? '*'}.${receiptIndex ?? '*'}.${
      logId ?? '*'
    }` as const;
  }

  /**
   * Sets the block height for the subject.
   * @param {BlockHeight | null} blockHeight - The block height to set.
   * @returns instance.
   */
  withBlockHeight(blockHeight: BlockHeight | null) {
    return this.with('blockHeight', blockHeight);
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns instance.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the receipt index for the subject.
   * @param {number | null} receiptIndex - The receipt index to set.
   * @returns instance.
   */
  withReceiptIndex(receiptIndex: number | null) {
    return this.with('receiptIndex', receiptIndex);
  }

  /**
   * Sets the log ID for the subject.
   * @param {Bytes32 | null} logId - The log ID to set.
   * @returns instance.
   */
  withLogId(logId: Bytes32 | null) {
    return this.with('logId', logId);
  }
}
