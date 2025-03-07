/**
 * This file is auto-generated by scripts/generate-subjects.ts
 * Do not edit this file manually
 *
 * Generated Subjects:
 * - TransactionsSubject
 */

import { TransactionParser } from '../../parsers';
import type {
  BlockHeight,
  RawTransaction,
  Transaction,
  TransactionStatus,
  TransactionType,
  TxId,
} from '../../types';
import { SubjectBase } from '../subject-base';

type TransactionsFields = {
  blockHeight: BlockHeight;
  txId: TxId;
  txIndex: number;
  txStatus: TransactionStatus;
  txType: TransactionType;
};

export class TransactionsSubject extends SubjectBase<
  TransactionsFields,
  Transaction,
  RawTransaction
> {
  metadata = {
    id: 'transactions',
    format:
      'transactions.{block_height}.{tx_id}.{tx_index}.{tx_status}.{tx_type}',
    parser: new TransactionParser(),
  };
}
