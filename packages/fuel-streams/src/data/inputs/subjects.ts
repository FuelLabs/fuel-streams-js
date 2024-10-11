import type { Address, AssetId, Bytes32, ContractId, IdentifierKind } from '..';
import { SubjectBase } from '../subject';

export enum InputsWildcard {
  All = 'inputs.>',
  ById = 'by_id.inputs.>',
}

interface InputsByIdFields {
  idKind: IdentifierKind;
  idValue: Bytes32;
}

export class InputsByIdSubject extends SubjectBase<InputsByIdFields> {
  parse() {
    const { idKind, idValue } = this.fields;
    return `by_id.inputs.${idKind ?? '*'}.${idValue ?? '*'}` as const;
  }

  withIdKind(idKind: IdentifierKind | null) {
    return this.with('idKind', idKind);
  }

  withIdValue(idValue: Bytes32 | null) {
    return this.with('idValue', idValue);
  }
}

interface InputsFields {
  txId: Bytes32;
  index: number;
}

export class InputsSubject<T extends InputsFields> extends SubjectBase<T> {
  parse() {
    const { txId, index } = this.fields;
    return `inputs.${txId ?? '*'}.${index ?? '*'}.>` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }
}

interface InputsCoinFields {
  txId: Bytes32;
  index: number;
  owner: Address;
  assetId: AssetId;
}

export class InputsCoinSubject extends SubjectBase<InputsCoinFields> {
  parse() {
    const { txId, index, owner, assetId } = this.fields;
    return `inputs.${txId ?? '*'}.${index ?? '*'}.coin.${owner ?? '*'}.${
      assetId ?? '*'
    }` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }

  withOwner(owner: Address | null) {
    return this.with('owner', owner);
  }

  withAssetId(assetId: AssetId | null) {
    return this.with('assetId', assetId);
  }
}

interface InputsContractFields {
  txId: Bytes32;
  index: number;
  contractId: ContractId;
}

export class InputsContractSubject extends SubjectBase<InputsContractFields> {
  parse() {
    const { txId, index, contractId } = this.fields;
    return `inputs.${txId ?? '*'}.${index ?? '*'}.contract.${
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

interface InputsMessageFields {
  txId: Bytes32;
  index: number;
  sender: Address;
  recipient: Address;
}

export class InputsMessageSubject extends SubjectBase<InputsMessageFields> {
  parse() {
    const { txId, index, sender, recipient } = this.fields;
    return `inputs.${txId ?? '*'}.${index ?? '*'}.message.${sender ?? '*'}.${
      recipient ?? '*'
    }` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }

  withSender(sender: Address | null) {
    return this.with('sender', sender);
  }

  withRecipient(recipient: Address | null) {
    return this.with('recipient', recipient);
  }
}
