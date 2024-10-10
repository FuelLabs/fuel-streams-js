import type { Address, AssetId, Bytes32, ContractId, IdentifierKind } from '..';

export enum OutputsWildcard {
  All = 'outputs.>',
  ById = 'by_id.outputs.>',
}

export class OutputsByIdSubject {
  idKind?: IdentifierKind;
  idValue?: Bytes32;

  constructor(idKind?: IdentifierKind, idValue?: Bytes32) {
    this.idKind = idKind;
    this.idValue = idValue;
  }

  parse() {
    return `by_id.outputs.${this.idKind || '*'}.${
      this.idValue || '*'
    }` as const;
  }

  withIdKind(idKind?: IdentifierKind) {
    this.idKind = idKind;
    return this;
  }

  withIdValue(idValue?: Bytes32) {
    this.idValue = idValue;
    return this;
  }
}

export class OutputsCoinSubject {
  txId?: Bytes32;
  index?: number;
  to?: Address;
  assetId?: AssetId;

  constructor(txId?: Bytes32, index?: number, to?: Address, assetId?: AssetId) {
    this.txId = txId;
    this.index = index;
    this.to = to;
    this.assetId = assetId;
  }

  parse() {
    return `outputs.coin.${this.txId || '*'}.${this.index || '*'}.${
      this.to || '*'
    }.${this.assetId || '*'}` as const;
  }

  withTxId(txId?: Bytes32) {
    this.txId = txId;
    return this;
  }

  withIndex(index?: number) {
    this.index = index;
    return this;
  }

  withTo(to?: Address) {
    this.to = to;
    return this;
  }

  withAssetId(assetId?: AssetId) {
    this.assetId = assetId;
    return this;
  }
}

export class OutputsContractSubject {
  txId?: Bytes32;
  index?: number;
  contractId?: ContractId;

  constructor(txId?: Bytes32, index?: number, contractId?: ContractId) {
    this.txId = txId;
    this.index = index;
    this.contractId = contractId;
  }

  parse() {
    return `outputs.contract.${this.txId || '*'}.${this.index || '*'}.${
      this.contractId || '*'
    }` as const;
  }

  withTxId(txId?: Bytes32) {
    this.txId = txId;
    return this;
  }

  withIndex(index?: number) {
    this.index = index;
    return this;
  }

  withContractId(contractId?: ContractId) {
    this.contractId = contractId;
    return this;
  }
}

export class OutputsChangeSubject {
  txId?: Bytes32;
  index?: number;
  to?: Address;
  assetId?: AssetId;

  constructor(txId?: Bytes32, index?: number, to?: Address, assetId?: AssetId) {
    this.txId = txId;
    this.index = index;
    this.to = to;
    this.assetId = assetId;
  }

  parse() {
    return `outputs.change.${this.txId || '*'}.${this.index || '*'}.${
      this.to || '*'
    }.${this.assetId || '*'}` as const;
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

  constructor(txId?: Bytes32, index?: number, to?: Address, assetId?: AssetId) {
    this.txId = txId;
    this.index = index;
    this.to = to;
    this.assetId = assetId;
  }

  parse() {
    return `outputs.variable.${this.txId || '*'}.${this.index || '*'}.${
      this.to || '*'
    }.${this.assetId || '*'}` as const;
  }

  withTxId(txId?: Bytes32) {
    this.txId = txId;
    return this;
  }

  withIndex(index?: number) {
    this.index = index;
    return this;
  }

  withTo(to?: Address) {
    this.to = to;
    return this;
  }

  withAssetId(assetId?: AssetId) {
    this.assetId = assetId;
    return this;
  }
}

export class OutputsContractCreatedSubject {
  txId?: Bytes32;
  index?: number;
  contractId?: ContractId;

  constructor(txId?: Bytes32, index?: number, contractId?: ContractId) {
    this.txId = txId;
    this.index = index;
    this.contractId = contractId;
  }

  parse() {
    return `outputs.contract_created.${this.txId || '*'}.${this.index || '*'}.${
      this.contractId || '*'
    }` as const;
  }

  withTxId(txId?: Bytes32) {
    this.txId = txId;
    return this;
  }

  withIndex(index?: number) {
    this.index = index;
    return this;
  }

  withContractId(contractId?: ContractId) {
    this.contractId = contractId;
    return this;
  }
}
