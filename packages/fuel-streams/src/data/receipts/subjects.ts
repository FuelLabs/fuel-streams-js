import type { AssetId, Bytes32, ContractId } from '..';

export class ReceiptsByIdSubject {
  idKind?: string;
  idValue?: Bytes32;

  static readonly WILDCARD = 'by_id.receipts.>';

  constructor(idKind?: string, idValue?: Bytes32) {
    this.idKind = idKind;
    this.idValue = idValue;
  }

  parse(): string {
    return `by_id.receipts.${this.idKind || '*'}.${this.idValue || '*'}`;
  }

  static wildcard(idKind?: string, idValue?: Bytes32): string {
    return `by_id.receipts.${idKind || '*'}.${idValue || '*'}`;
  }
}

export class ReceiptsCallSubject {
  txId?: Bytes32;
  index?: number;
  from?: ContractId;
  to?: ContractId;
  assetId?: AssetId;

  static readonly WILDCARD = 'receipts.>';

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

  parse(): string {
    return `receipts.${this.txId || '*'}.${this.index || '*'}.call.${
      this.from || '*'
    }.${this.to || '*'}.${this.assetId || '*'}`;
  }

  static wildcard(txId?: Bytes32, index?: number): string {
    return `receipts.${txId || '*'}.${index || '*'}.call.*.*.*`;
  }
}

export class ReceiptsReturnSubject {
  txId?: Bytes32;
  index?: number;
  id?: ContractId;

  static readonly WILDCARD = 'receipts.>';

  constructor(txId?: Bytes32, index?: number, id?: ContractId) {
    this.txId = txId;
    this.index = index;
    this.id = id;
  }

  parse(): string {
    return `receipts.${this.txId || '*'}.${this.index || '*'}.return.${
      this.id || '*'
    }`;
  }

  static wildcard(txId?: Bytes32, index?: number): string {
    return `receipts.${txId || '*'}.${index || '*'}.return.*`;
  }
}

export class ReceiptsTransferSubject {
  txId?: Bytes32;
  index?: number;
  from?: ContractId;
  to?: ContractId;
  assetId?: AssetId;

  static readonly WILDCARD = 'receipts.>';

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

  parse(): string {
    return `receipts.${this.txId || '*'}.${this.index || '*'}.transfer.${
      this.from || '*'
    }.${this.to || '*'}.${this.assetId || '*'}`;
  }

  static wildcard(txId?: Bytes32, index?: number): string {
    return `receipts.${txId || '*'}.${index || '*'}.transfer.*.*.*`;
  }
}
