import type {
  Address,
  BlockHeight,
  Bytes32,
  IdentifierKind,
  TransactionKind,
  TransactionStatus,
} from '..';
import { SubjectBase } from '../subject';

export enum TransactionsWildcard {
  All = 'transactions.>',
  ById = 'by_id.transactions.>',
}

interface TransactionsFields {
  blockHeight: BlockHeight;
  txIndex: number;
  txId: Bytes32;
  status: TransactionStatus;
  kind: TransactionKind;
}

export class TransactionsSubject extends SubjectBase<TransactionsFields> {
  parse() {
    const { blockHeight, txIndex, txId, status, kind } = this.fields;
    return `transactions.${blockHeight ?? '*'}.${txIndex ?? '*'}.${
      txId ?? '*'
    }.${status ?? '*'}.${kind ?? '*'}` as const;
  }

  withBlockHeight(blockHeight: BlockHeight | null) {
    return this.with('blockHeight', blockHeight);
  }

  withTxIndex(txIndex: number | null) {
    return this.with('txIndex', txIndex);
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withStatus(status: TransactionStatus | null) {
    return this.with('status', status);
  }

  withKind(kind: TransactionKind | null) {
    return this.with('kind', kind);
  }
}

interface TransactionsByIdFields {
  idKind: IdentifierKind;
  idValue: Address;
}

export class TransactionsByIdSubject extends SubjectBase<TransactionsByIdFields> {
  parse() {
    const { idKind, idValue } = this.fields;
    return `by_id.transactions.${idKind ?? '*'}.${idValue ?? '*'}` as const;
  }

  withIdKind(idKind: IdentifierKind | null) {
    return this.with('idKind', idKind);
  }

  withIdValue(idValue: Address | null) {
    return this.with('idValue', idValue);
  }
}
