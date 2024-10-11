import type {
  Address,
  BlockHeight,
  Bytes32,
  IdentifierKind,
  TransactionKind,
  TransactionStatus,
} from '..';
import { SubjectBase } from '../../streams/subject';

/**
 * Enum representing wildcards for transaction subjects.
 * @enum {string}
 *
 * @example
 * // Using the All wildcard
 * const allTransactions = TransactionsWildcard.All;
 * console.log(allTransactions); // 'transactions.>'
 *
 * // Using the ById wildcard
 * const transactionsById = TransactionsWildcard.ById;
 * console.log(transactionsById); // 'by_id.transactions.>'
 */
export enum TransactionsWildcard {
  /** Wildcard for all transactions */
  All = 'transactions.>',
  /** Wildcard for transactions by ID */
  ById = 'by_id.transactions.>',
}

/**
 * Interface representing the fields of a transaction.
 * @interface
 */
interface TransactionsFields {
  /** The block height of the transaction */
  blockHeight: BlockHeight;
  /** The index of the transaction within the block */
  txIndex: number;
  /** The unique identifier of the transaction */
  txId: Bytes32;
  /** The status of the transaction */
  status: TransactionStatus;
  /** The kind of transaction */
  kind: TransactionKind;
}

/**
 * Class representing a subject for transactions.
 * @extends {SubjectBase<TransactionsFields>}
 *
 * @example
 * ```typescript
 * const subject = new TransactionsSubject()
 *   .withBlockHeight(100)
 *   .withTxId('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
 *   .withStatus('success')
 *   .withKind('script');
 * console.log(subject.parse());
 * // Output: transactions.100.*.0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef.success.script
 * ```
 */
export class TransactionsSubject extends SubjectBase<TransactionsFields> {
  /**
   * Parses the transaction fields into a string representation.
   * @returns A string representation of the transaction.
   */
  parse() {
    const { blockHeight, txIndex, txId, status, kind } = this.fields;
    return `transactions.${blockHeight ?? '*'}.${txIndex ?? '*'}.${
      txId ?? '*'
    }.${status ?? '*'}.${kind ?? '*'}` as const;
  }

  /**
   * Sets the block height for the transaction subject.
   * @param {BlockHeight | null} blockHeight - The block height to set.
   * @returns A new TransactionsSubject with the updated block height.
   */
  withBlockHeight(blockHeight: BlockHeight | null) {
    return this.with('blockHeight', blockHeight);
  }

  /**
   * Sets the transaction index for the transaction subject.
   * @param {number | null} txIndex - The transaction index to set.
   * @returns A new TransactionsSubject with the updated transaction index.
   */
  withTxIndex(txIndex: number | null) {
    return this.with('txIndex', txIndex);
  }

  /**
   * Sets the transaction ID for the transaction subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns A new TransactionsSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the status for the transaction subject.
   * @param {TransactionStatus | null} status - The status to set.
   * @returns A new TransactionsSubject with the updated status.
   */
  withStatus(status: TransactionStatus | null) {
    return this.with('status', status);
  }

  /**
   * Sets the kind for the transaction subject.
   * @param {TransactionKind | null} kind - The kind to set.
   * @returns A new TransactionsSubject with the updated kind.
   */
  withKind(kind: TransactionKind | null) {
    return this.with('kind', kind);
  }
}

/**
 * Interface representing the fields of a transaction by ID.
 * @interface
 */
interface TransactionsByIdFields {
  /** The kind of identifier */
  idKind: IdentifierKind;
  /** The value of the identifier */
  idValue: Address;
}

/**
 * Class representing a subject for transactions by ID.
 * @extends {SubjectBase<TransactionsByIdFields>}
 *
 * @example
 * ```typescript
 * const subject = new TransactionsByIdSubject()
 *   .withIdKind('B256')
 *   .withIdValue('fuel1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsx2tme');
 * console.log(subject.parse());
 * // Output: by_id.transactions.B256.fuel1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsx2tme
 * ```
 */
export class TransactionsByIdSubject extends SubjectBase<TransactionsByIdFields> {
  /**
   * Parses the transaction by ID fields into a string representation.
   * @returns A string representation of the transaction by ID.
   */
  parse() {
    const { idKind, idValue } = this.fields;
    return `by_id.transactions.${idKind ?? '*'}.${idValue ?? '*'}` as const;
  }

  /**
   * Sets the identifier kind for the transaction by ID subject.
   * @param {IdentifierKind | null} idKind - The identifier kind to set.
   * @returns A new TransactionsByIdSubject with the updated identifier kind.
   */
  withIdKind(idKind: IdentifierKind | null) {
    return this.with('idKind', idKind);
  }

  /**
   * Sets the identifier value for the transaction by ID subject.
   * @param {Address | null} idValue - The identifier value to set.
   * @returns A new TransactionsByIdSubject with the updated identifier value.
   */
  withIdValue(idValue: Address | null) {
    return this.with('idValue', idValue);
  }
}
