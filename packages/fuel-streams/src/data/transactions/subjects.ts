import type {
  Address,
  BlockHeight,
  Bytes32,
  IdentifierKind,
  TransactionKind,
  TransactionStatus,
} from '..';

export class TransactionsSubject {
  blockHeight?: BlockHeight;
  txIndex?: number;
  txId?: Bytes32;
  status?: TransactionStatus;
  kind?: TransactionKind;

  static readonly WILDCARD = 'transactions.>';

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

  parse(): string {
    const parts = [
      'transactions',
      this.blockHeight?.toString() || '*',
      this.txIndex?.toString() || '*',
      this.txId || '*',
      this.status || '*',
      this.kind || '*',
    ];
    return parts.join('.');
  }

  static wildcard(
    blockHeight?: BlockHeight,
    txIndex?: number,
    txId?: Bytes32,
    status?: TransactionStatus,
    kind?: TransactionKind,
  ): string {
    const parts = [
      'transactions',
      blockHeight?.toString() || '*',
      txIndex?.toString() || '*',
      txId || '*',
      status || '*',
      kind || '*',
    ];
    return parts.join('.');
  }

  withBlockHeight(blockHeight?: BlockHeight): this {
    this.blockHeight = blockHeight;
    return this;
  }

  withTxIndex(txIndex?: number): this {
    this.txIndex = txIndex;
    return this;
  }

  withTxId(txId?: Bytes32): this {
    this.txId = txId;
    return this;
  }

  withStatus(status?: TransactionStatus): this {
    this.status = status;
    return this;
  }

  withKind(kind?: TransactionKind): this {
    this.kind = kind;
    return this;
  }

  static new(): TransactionsSubject {
    return new TransactionsSubject();
  }
}

export class TransactionsByIdSubject {
  idKind?: IdentifierKind;
  idValue?: Address;

  static readonly WILDCARD = 'by_id.transactions.>';

  constructor(idKind?: IdentifierKind, idValue?: Address) {
    this.idKind = idKind;
    this.idValue = idValue;
  }

  parse(): string {
    const parts = [
      'by_id.transactions',
      this.idKind || '*',
      this.idValue || '*',
    ];
    return parts.join('.');
  }

  static wildcard(idKind?: IdentifierKind, idValue?: Address): string {
    const parts = ['by_id.transactions', idKind || '*', idValue || '*'];
    return parts.join('.');
  }

  withIdKind(idKind?: IdentifierKind): this {
    this.idKind = idKind;
    return this;
  }

  withIdValue(idValue?: Address): this {
    this.idValue = idValue;
    return this;
  }

  static new(): TransactionsByIdSubject {
    return new TransactionsByIdSubject();
  }
}
