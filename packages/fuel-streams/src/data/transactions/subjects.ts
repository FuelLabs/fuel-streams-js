import type {
  Address,
  BlockHeight,
  Bytes32,
  IdentifierKind,
  TransactionKind,
  TransactionStatus,
} from '..';

export enum TransactionsWildcard {
  All = 'transactions.>',
  ById = 'by_id.transactions.>',
}

export class TransactionsSubject {
  blockHeight?: BlockHeight;
  txIndex?: number;
  txId?: Bytes32;
  status?: TransactionStatus;
  kind?: TransactionKind;

  constructor(
    blockHeight?: BlockHeight,
    txIndex?: number,
    txId?: Bytes32,
    status?: TransactionStatus,
    kind?: TransactionKind,
  ) {
    this.blockHeight = blockHeight;
    this.txIndex = txIndex;
    this.txId = txId;
    this.status = status;
    this.kind = kind;
  }

  parse() {
    return `transactions.${this.blockHeight || '*'}.${this.txIndex || '*'}.${
      this.txId || '*'
    }.${this.status || '*'}.${this.kind || '*'}` as const;
  }

  static wildcard(
    blockHeight?: BlockHeight,
    txIndex?: number,
    txId?: Bytes32,
    status?: TransactionStatus,
    kind?: TransactionKind,
  ) {
    return new TransactionsSubject(
      blockHeight,
      txIndex,
      txId,
      status,
      kind,
    ).parse();
  }

  withBlockHeight(blockHeight?: BlockHeight) {
    this.blockHeight = blockHeight;
    return this;
  }

  withTxIndex(txIndex?: number) {
    this.txIndex = txIndex;
    return this;
  }

  withTxId(txId?: Bytes32) {
    this.txId = txId;
    return this;
  }

  withStatus(status?: TransactionStatus) {
    this.status = status;
    return this;
  }

  withKind(kind?: TransactionKind) {
    this.kind = kind;
    return this;
  }

  static new() {
    return new TransactionsSubject();
  }
}

export class TransactionsByIdSubject {
  idKind?: IdentifierKind;
  idValue?: Address;

  constructor(idKind?: IdentifierKind, idValue?: Address) {
    this.idKind = idKind;
    this.idValue = idValue;
  }

  parse() {
    return `by_id.transactions.${this.idKind || '*'}.${
      this.idValue || '*'
    }` as const;
  }

  static wildcard(idKind?: IdentifierKind, idValue?: Address) {
    return new TransactionsByIdSubject(idKind, idValue).parse();
  }

  withIdKind(idKind?: IdentifierKind) {
    this.idKind = idKind;
    return this;
  }

  withIdValue(idValue?: Address) {
    this.idValue = idValue;
    return this;
  }

  static new() {
    return new TransactionsByIdSubject();
  }
}
