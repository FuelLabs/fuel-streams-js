import type { Address, AssetId, Bytes32, ContractId, IdentifierKind } from '..';

export class OutputsByIdSubject {
  idKind?: IdentifierKind;
  idValue?: Bytes32;

  static readonly WILDCARD = 'by_id.outputs.>';

  constructor(idKind?: IdentifierKind, idValue?: Bytes32) {
    this.idKind = idKind;
    this.idValue = idValue;
  }

  parse(): string {
    const parts = ['by_id.outputs', this.idKind || '*', this.idValue || '*'];
    return parts.join('.');
  }

  withIdKind(idKind?: IdentifierKind): this {
    this.idKind = idKind;
    return this;
  }

  withIdValue(idValue?: Bytes32): this {
    this.idValue = idValue;
    return this;
  }
}

export class OutputsCoinSubject {
  txId?: Bytes32;
  index?: number;
  to?: Address;
  assetId?: AssetId;

  static readonly WILDCARD = 'outputs.>';

  constructor(txId?: Bytes32, index?: number, to?: Address, assetId?: AssetId) {
    this.txId = txId;
    this.index = index;
    this.to = to;
    this.assetId = assetId;
  }

  parse(): string {
    const parts = [
      'outputs.coin',
      this.txId || '*',
      this.index?.toString() || '*',
      this.to || '*',
      this.assetId || '*',
    ];
    return parts.join('.');
  }

  withTxId(txId?: Bytes32): this {
    this.txId = txId;
    return this;
  }

  withIndex(index?: number): this {
    this.index = index;
    return this;
  }

  withTo(to?: Address): this {
    this.to = to;
    return this;
  }

  withAssetId(assetId?: AssetId): this {
    this.assetId = assetId;
    return this;
  }
}

export class OutputsContractSubject {
  txId?: Bytes32;
  index?: number;
  contractId?: ContractId;

  static readonly WILDCARD = 'outputs.>';

  constructor(txId?: Bytes32, index?: number, contractId?: ContractId) {
    this.txId = txId;
    this.index = index;
    this.contractId = contractId;
  }

  parse(): string {
    const parts = [
      'outputs.contract',
      this.txId || '*',
      this.index?.toString() || '*',
      this.contractId || '*',
    ];
    return parts.join('.');
  }

  withTxId(txId?: Bytes32): this {
    this.txId = txId;
    return this;
  }

  withIndex(index?: number): this {
    this.index = index;
    return this;
  }

  withContractId(contractId?: ContractId): this {
    this.contractId = contractId;
    return this;
  }
}

export class OutputsChangeSubject {
  txId?: Bytes32;
  index?: number;
  to?: Address;
  assetId?: AssetId;

  static readonly WILDCARD = 'outputs.>';

  constructor(txId?: Bytes32, index?: number, to?: Address, assetId?: AssetId) {
    this.txId = txId;
    this.index = index;
    this.to = to;
    this.assetId = assetId;
  }

  parse(): string {
    const parts = [
      'outputs.change',
      this.txId || '*',
      this.index?.toString() || '*',
      this.to || '*',
      this.assetId || '*',
    ];
    return parts.join('.');
  }

  withTxId(txId?: Bytes32): this {
    this.txId = txId;
    return this;
  }

  withIndex(index?: number): this {
    this.index = index;
    return this;
  }

  withTo(to?: Address): this {
    this.to = to;
    return this;
  }

  withAssetId(assetId?: AssetId): this {
    this.assetId = assetId;
    return this;
  }
}

export class OutputsVariableSubject {
  txId?: Bytes32;
  index?: number;
  to?: Address;
  assetId?: AssetId;

  static readonly WILDCARD = 'outputs.>';

  constructor(txId?: Bytes32, index?: number, to?: Address, assetId?: AssetId) {
    this.txId = txId;
    this.index = index;
    this.to = to;
    this.assetId = assetId;
  }

  parse(): string {
    const parts = [
      'outputs.variable',
      this.txId || '*',
      this.index?.toString() || '*',
      this.to || '*',
      this.assetId || '*',
    ];
    return parts.join('.');
  }

  withTxId(txId?: Bytes32): this {
    this.txId = txId;
    return this;
  }

  withIndex(index?: number): this {
    this.index = index;
    return this;
  }

  withTo(to?: Address): this {
    this.to = to;
    return this;
  }

  withAssetId(assetId?: AssetId): this {
    this.assetId = assetId;
    return this;
  }
}

export class OutputsContractCreatedSubject {
  txId?: Bytes32;
  index?: number;
  contractId?: ContractId;

  static readonly WILDCARD = 'outputs.>';

  constructor(txId?: Bytes32, index?: number, contractId?: ContractId) {
    this.txId = txId;
    this.index = index;
    this.contractId = contractId;
  }

  parse(): string {
    const parts = [
      'outputs.contract_created',
      this.txId || '*',
      this.index?.toString() || '*',
      this.contractId || '*',
    ];
    return parts.join('.');
  }

  withTxId(txId?: Bytes32): this {
    this.txId = txId;
    return this;
  }

  withIndex(index?: number): this {
    this.index = index;
    return this;
  }

  withContractId(contractId?: ContractId): this {
    this.contractId = contractId;
    return this;
  }
}
