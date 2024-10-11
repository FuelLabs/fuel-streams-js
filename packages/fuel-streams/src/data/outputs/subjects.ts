import type { Address, AssetId, Bytes32, ContractId, IdentifierKind } from '..';
import { SubjectBase } from '../subject';

export enum OutputsWildcard {
  All = 'outputs.>',
  ById = 'by_id.outputs.>',
}

interface OutputsByIdFields {
  idKind: IdentifierKind;
  idValue: Bytes32;
}

export class OutputsByIdSubject extends SubjectBase<OutputsByIdFields> {
  parse() {
    const { idKind, idValue } = this.fields;
    return `by_id.outputs.${idKind ?? '*'}.${idValue ?? '*'}` as const;
  }

  withIdKind(idKind: IdentifierKind | null) {
    return this.with('idKind', idKind);
  }

  withIdValue(idValue: Bytes32 | null) {
    return this.with('idValue', idValue);
  }
}

export interface OutputsFields {
  txId: Bytes32;
  index: number;
}

export class OutputsSubject<T extends OutputsFields> extends SubjectBase<T> {
  parse() {
    const { txId, index } = this.fields;
    return `outputs.${txId ?? '*'}.${index ?? '*'}.>` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }
}

interface OutputsCoinFields {
  txId: Bytes32;
  index: number;
  to: Address;
  assetId: AssetId;
}

export class OutputsCoinSubject extends SubjectBase<OutputsCoinFields> {
  parse() {
    const { txId, index, to, assetId } = this.fields;
    return `outputs.coin.${txId ?? '*'}.${index ?? '*'}.${to ?? '*'}.${
      assetId ?? '*'
    }` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }

  withTo(to: Address | null) {
    return this.with('to', to);
  }

  withAssetId(assetId: AssetId | null) {
    return this.with('assetId', assetId);
  }
}

interface OutputsContractFields {
  txId: Bytes32;
  index: number;
  contractId: ContractId;
}

export class OutputsContractSubject extends SubjectBase<OutputsContractFields> {
  parse() {
    const { txId, index, contractId } = this.fields;
    return `outputs.contract.${txId ?? '*'}.${index ?? '*'}.${
      contractId ?? '*'
    }` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }

  withContractId(contractId: ContractId | null) {
    return this.with('contractId', contractId);
  }
}

interface OutputsChangeFields {
  txId: Bytes32;
  index: number;
  to: Address;
  assetId: AssetId;
}

export class OutputsChangeSubject extends SubjectBase<OutputsChangeFields> {
  parse() {
    const { txId, index, to, assetId } = this.fields;
    return `outputs.change.${txId ?? '*'}.${index ?? '*'}.${to ?? '*'}.${
      assetId ?? '*'
    }` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }

  withTo(to: Address | null) {
    return this.with('to', to);
  }

  withAssetId(assetId: AssetId | null) {
    return this.with('assetId', assetId);
  }
}

interface OutputsVariableFields {
  txId: Bytes32;
  index: number;
  to: Address;
  assetId: AssetId;
}

export class OutputsVariableSubject extends SubjectBase<OutputsVariableFields> {
  parse() {
    const { txId, index, to, assetId } = this.fields;
    return `outputs.variable.${txId ?? '*'}.${index ?? '*'}.${to ?? '*'}.${
      assetId ?? '*'
    }` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }

  withTo(to: Address | null) {
    return this.with('to', to);
  }

  withAssetId(assetId: AssetId | null) {
    return this.with('assetId', assetId);
  }
}
