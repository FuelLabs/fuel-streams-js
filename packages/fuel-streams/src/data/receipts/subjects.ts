import type { AssetId, Bytes32, ContractId, IdentifierKind } from '..';

export enum ReceiptsWildcard {
  All = 'receipts.>',
  ById = 'by_id.receipts.>',
}

export class ReceiptsByIdSubject {
  idKind?: IdentifierKind;
  idValue?: Bytes32;

  constructor(idKind?: IdentifierKind, idValue?: Bytes32) {
    this.idKind = idKind;
    this.idValue = idValue;
  }

  parse() {
    return `by_id.receipts.${this.idKind || '*'}.${
      this.idValue || '*'
    }` as const;
  }

  static wildcard(idKind?: IdentifierKind, idValue?: Bytes32) {
    return `by_id.receipts.${idKind || '*'}.${idValue || '*'}` as const;
  }
}

export class ReceiptsCallSubject {
  txId?: Bytes32;
  index?: number;
  from?: ContractId;
  to?: ContractId;
  assetId?: AssetId;

  constructor(
    txId?: Bytes32,
    index?: number,
    from?: ContractId,
    to?: ContractId,
    assetId?: AssetId,
  ) {
    this.txId = txId;
    this.index = index;
    this.from = from;
    this.to = to;
    this.assetId = assetId;
  }

  parse() {
    return `receipts.${this.txId || '*'}.${this.index || '*'}.call.${
      this.from || '*'
    }.${this.to || '*'}.${this.assetId || '*'}` as const;
  }

  static wildcard(txId?: Bytes32, index?: number) {
    return `receipts.${txId || '*'}.${index || '*'}.call.*.*.*` as const;
  }
}

export class ReceiptsReturnSubject {
  txId?: Bytes32;
  index?: number;
  id?: ContractId;

  constructor(txId?: Bytes32, index?: number, id?: ContractId) {
    this.txId = txId;
    this.index = index;
    this.id = id;
  }

  parse() {
    return `receipts.${this.txId || '*'}.${this.index || '*'}.return.${
      this.id || '*'
    }` as const;
  }

  static wildcard(txId?: Bytes32, index?: number) {
    return `receipts.${txId || '*'}.${index || '*'}.return.*` as const;
  }
}

export class ReceiptsTransferSubject {
  txId?: Bytes32;
  index?: number;
  from?: ContractId;
  to?: ContractId;
  assetId?: AssetId;

  constructor(
    txId?: Bytes32,
    index?: number,
    from?: ContractId,
    to?: ContractId,
    assetId?: AssetId,
  ) {
    this.txId = txId;
    this.index = index;
    this.from = from;
    this.to = to;
    this.assetId = assetId;
  }

  parse() {
    return `receipts.${this.txId || '*'}.${this.index || '*'}.transfer.${
      this.from || '*'
    }.${this.to || '*'}.${this.assetId || '*'}` as const;
  }

  static wildcard(txId?: Bytes32, index?: number) {
    return `receipts.${txId || '*'}.${index || '*'}.transfer.*.*.*` as const;
  }
}
