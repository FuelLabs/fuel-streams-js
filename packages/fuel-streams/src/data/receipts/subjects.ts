import type { Address, AssetId, Bytes32, ContractId, IdentifierKind } from '..';
import { SubjectBase } from '../subject';

export enum ReceiptsWildcard {
  All = 'receipts.>',
  ById = 'by_id.receipts.>',
}

interface ReceiptsByIdFields {
  idKind: IdentifierKind;
  idValue: Bytes32;
}

export class ReceiptsByIdSubject extends SubjectBase<ReceiptsByIdFields> {
  parse() {
    const { idKind, idValue } = this.fields;
    return `by_id.receipts.${idKind ?? '*'}.${idValue ?? '*'}` as const;
  }

  withIdKind(idKind: IdentifierKind | null) {
    return this.with('idKind', idKind);
  }

  withIdValue(idValue: Bytes32 | null) {
    return this.with('idValue', idValue);
  }
}

export interface ReceiptsFields {
  txId: Bytes32;
  index: number;
}

export class ReceiptsSubject<T extends ReceiptsFields> extends SubjectBase<T> {
  parse() {
    const { txId, index } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.>` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }
}

interface ReceiptsCallFields {
  txId: Bytes32;
  index: number;
  from: ContractId;
  to: ContractId;
  assetId: AssetId;
}

export class ReceiptsCallSubject extends SubjectBase<ReceiptsCallFields> {
  parse() {
    const { txId, index, from, to, assetId } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.call.${from ?? '*'}.${
      to ?? '*'
    }.${assetId ?? '*'}` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }

  withFrom(from: ContractId | null) {
    return this.with('from', from);
  }

  withTo(to: ContractId | null) {
    return this.with('to', to);
  }

  withAssetId(assetId: AssetId | null) {
    return this.with('assetId', assetId);
  }
}

interface ReceiptsReturnFields {
  txId: Bytes32;
  index: number;
  id: ContractId;
}

export class ReceiptsReturnSubject extends SubjectBase<ReceiptsReturnFields> {
  parse() {
    const { txId, index, id } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.return.${
      id ?? '*'
    }` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }

  withId(id: ContractId | null) {
    return this.with('id', id);
  }
}

interface ReceiptsTransferFields {
  txId: Bytes32;
  index: number;
  from: ContractId;
  to: ContractId;
  assetId: AssetId;
}

export class ReceiptsTransferSubject extends SubjectBase<ReceiptsTransferFields> {
  parse() {
    const { txId, index, from, to, assetId } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.transfer.${from ?? '*'}.${
      to ?? '*'
    }.${assetId ?? '*'}` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }

  withFrom(from: ContractId | null) {
    return this.with('from', from);
  }

  withTo(to: ContractId | null) {
    return this.with('to', to);
  }

  withAssetId(assetId: AssetId | null) {
    return this.with('assetId', assetId);
  }
}

interface ReceiptsReturnDataFields {
  txId: Bytes32;
  index: number;
  id: ContractId;
}

export class ReceiptsReturnDataSubject extends SubjectBase<ReceiptsReturnDataFields> {
  parse() {
    const { txId, index, id } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.return_data.${
      id ?? '*'
    }` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }

  withId(id: ContractId | null) {
    return this.with('id', id);
  }
}

interface ReceiptsPanicFields {
  txId: Bytes32;
  index: number;
  id: ContractId;
}

export class ReceiptsPanicSubject extends SubjectBase<ReceiptsPanicFields> {
  parse() {
    const { txId, index, id } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.panic.${
      id ?? '*'
    }` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }

  withId(id: ContractId | null) {
    return this.with('id', id);
  }
}

interface ReceiptsRevertFields {
  txId: Bytes32;
  index: number;
  id: ContractId;
}

export class ReceiptsRevertSubject extends SubjectBase<ReceiptsRevertFields> {
  parse() {
    const { txId, index, id } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.revert.${
      id ?? '*'
    }` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }

  withId(id: ContractId | null) {
    return this.with('id', id);
  }
}

interface ReceiptsLogFields {
  txId: Bytes32;
  index: number;
  id: ContractId;
}

export class ReceiptsLogSubject extends SubjectBase<ReceiptsLogFields> {
  parse() {
    const { txId, index, id } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.log.${id ?? '*'}` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }

  withId(id: ContractId | null) {
    return this.with('id', id);
  }
}

interface ReceiptsLogDataFields {
  txId: Bytes32;
  index: number;
  id: ContractId;
}

export class ReceiptsLogDataSubject extends SubjectBase<ReceiptsLogDataFields> {
  parse() {
    const { txId, index, id } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.log_data.${
      id ?? '*'
    }` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }

  withId(id: ContractId | null) {
    return this.with('id', id);
  }
}

interface ReceiptsScriptResultFields {
  txId: Bytes32;
  index: number;
}

export class ReceiptsScriptResultSubject extends SubjectBase<ReceiptsScriptResultFields> {
  parse() {
    const { txId, index } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.script_result` as const;
  }

  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  withIndex(index: number | null) {
    return this.with('index', index);
  }
}

interface ReceiptsMessageOutFields {
  txId: Bytes32;
  index: number;
  sender: Address;
  recipient: Address;
}

export class ReceiptsMessageOutSubject extends SubjectBase<ReceiptsMessageOutFields> {
  parse() {
    const { txId, index, sender, recipient } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.message_out.${
      sender ?? '*'
    }.${recipient ?? '*'}` as const;
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

interface ReceiptsMintFields {
  txId: Bytes32;
  index: number;
  contractId: ContractId;
  subId: Bytes32;
}

export class ReceiptsMintSubject extends SubjectBase<ReceiptsMintFields> {
  parse() {
    const { txId, index, contractId, subId } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.mint.${contractId ?? '*'}.${
      subId ?? '*'
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

  withSubId(subId: Bytes32 | null) {
    return this.with('subId', subId);
  }
}

interface ReceiptsBurnFields {
  txId: Bytes32;
  index: number;
  contractId: ContractId;
  subId: Bytes32;
}

export class ReceiptsBurnSubject extends SubjectBase<ReceiptsBurnFields> {
  parse() {
    const { txId, index, contractId, subId } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.burn.${contractId ?? '*'}.${
      subId ?? '*'
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

  withSubId(subId: Bytes32 | null) {
    return this.with('subId', subId);
  }
}
