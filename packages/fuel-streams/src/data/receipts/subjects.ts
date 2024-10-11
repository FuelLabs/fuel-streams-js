import type { Address, AssetId, Bytes32, ContractId, IdentifierKind } from '..';
import { SubjectBase } from '../../streams/subject';

/**
 * Enum representing wildcards for receipt subjects.
 * @enum {string}
 */
export enum ReceiptsWildcard {
  /** Wildcard for all receipts */
  All = 'receipts.>',
  /** Wildcard for receipts by ID */
  ById = 'by_id.receipts.>',
}

/**
 * Interface representing the fields for receipts by ID.
 * @interface
 */
interface ReceiptsByIdFields {
  /** The kind of identifier */
  idKind: IdentifierKind;
  /** The value of the identifier */
  idValue: Bytes32;
}

/**
 * Subject class for receipts by ID.
 * @extends {SubjectBase<ReceiptsByIdFields>}
 */
export class ReceiptsByIdSubject extends SubjectBase<ReceiptsByIdFields> {
  /**
   * Parses the subject fields into a string.
   * @returns {string} The parsed subject string.
   */
  parse() {
    const { idKind, idValue } = this.fields;
    return `by_id.receipts.${idKind ?? '*'}.${idValue ?? '*'}` as const;
  }

  /**
   * Sets the ID kind for the subject.
   * @param {IdentifierKind | null} idKind - The ID kind to set.
   * @returns {ReceiptsByIdSubject} A new instance of ReceiptsByIdSubject with the updated ID kind.
   */
  withIdKind(idKind: IdentifierKind | null) {
    return this.with('idKind', idKind);
  }

  /**
   * Sets the ID value for the subject.
   * @param {Bytes32 | null} idValue - The ID value to set.
   * @returns {ReceiptsByIdSubject} A new instance of ReceiptsByIdSubject with the updated ID value.
   */
  withIdValue(idValue: Bytes32 | null) {
    return this.with('idValue', idValue);
  }
}

/**
 * Interface representing the fields for receipts.
 * @interface
 */
export interface ReceiptsFields {
  /** The transaction ID */
  txId: Bytes32;
  /** The index of the receipt */
  index: number;
}

/**
 * Subject class for receipts.
 * @extends {SubjectBase<T>}
 * @template T
 */
export class ReceiptsSubject<T extends ReceiptsFields> extends SubjectBase<T> {
  /**
   * Parses the subject fields into a string.
   * @returns {string} The parsed subject string.
   */
  parse() {
    const { txId, index } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.>` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns {ReceiptsSubject<T>} A new instance of ReceiptsSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns {ReceiptsSubject<T>} A new instance of ReceiptsSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }
}

/**
 * Interface representing the fields for receipts call.
 * @interface
 */
interface ReceiptsCallFields {
  /** The transaction ID */
  txId: Bytes32;
  /** The index of the receipt */
  index: number;
  /** The contract ID of the caller */
  from: ContractId;
  /** The contract ID of the callee */
  to: ContractId;
  /** The asset ID */
  assetId: AssetId;
}

/**
 * Subject class for receipts call.
 * @extends {SubjectBase<ReceiptsCallFields>}
 */
export class ReceiptsCallSubject extends SubjectBase<ReceiptsCallFields> {
  /**
   * Parses the subject fields into a string.
   * @returns {string} The parsed subject string.
   */
  parse() {
    const { txId, index, from, to, assetId } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.call.${from ?? '*'}.${
      to ?? '*'
    }.${assetId ?? '*'}` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns {ReceiptsCallSubject} A new instance of ReceiptsCallSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns {ReceiptsCallSubject} A new instance of ReceiptsCallSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the 'from' contract ID for the subject.
   * @param {ContractId | null} from - The 'from' contract ID to set.
   * @returns {ReceiptsCallSubject} A new instance of ReceiptsCallSubject with the updated 'from' contract ID.
   */
  withFrom(from: ContractId | null) {
    return this.with('from', from);
  }

  /**
   * Sets the 'to' contract ID for the subject.
   * @param {ContractId | null} to - The 'to' contract ID to set.
   * @returns {ReceiptsCallSubject} A new instance of ReceiptsCallSubject with the updated 'to' contract ID.
   */
  withTo(to: ContractId | null) {
    return this.with('to', to);
  }

  /**
   * Sets the asset ID for the subject.
   * @param {AssetId | null} assetId - The asset ID to set.
   * @returns {ReceiptsCallSubject} A new instance of ReceiptsCallSubject with the updated asset ID.
   */
  withAssetId(assetId: AssetId | null) {
    return this.with('assetId', assetId);
  }
}

/**
 * Interface representing the fields for receipts return.
 * @interface
 */
interface ReceiptsReturnFields {
  /** The transaction ID */
  txId: Bytes32;
  /** The index of the receipt */
  index: number;
  /** The contract ID */
  id: ContractId;
}

/**
 * Subject class for receipts return.
 * @extends {SubjectBase<ReceiptsReturnFields>}
 */
export class ReceiptsReturnSubject extends SubjectBase<ReceiptsReturnFields> {
  /**
   * Parses the subject fields into a string.
   * @returns {string} The parsed subject string.
   */
  parse() {
    const { txId, index, id } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.return.${
      id ?? '*'
    }` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns {ReceiptsReturnSubject} A new instance of ReceiptsReturnSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns {ReceiptsReturnSubject} A new instance of ReceiptsReturnSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the contract ID for the subject.
   * @param {ContractId | null} id - The contract ID to set.
   * @returns {ReceiptsReturnSubject} A new instance of ReceiptsReturnSubject with the updated contract ID.
   */
  withId(id: ContractId | null) {
    return this.with('id', id);
  }
}

/**
 * Interface representing the fields for receipts transfer.
 * @interface
 */
interface ReceiptsTransferFields {
  /** The transaction ID */
  txId: Bytes32;
  /** The index of the receipt */
  index: number;
  /** The contract ID of the sender */
  from: ContractId;
  /** The contract ID of the recipient */
  to: ContractId;
  /** The asset ID */
  assetId: AssetId;
}

/**
 * Subject class for receipts transfer.
 * @extends {SubjectBase<ReceiptsTransferFields>}
 */
export class ReceiptsTransferSubject extends SubjectBase<ReceiptsTransferFields> {
  /**
   * Parses the subject fields into a string.
   * @returns {string} The parsed subject string.
   */
  parse() {
    const { txId, index, from, to, assetId } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.transfer.${from ?? '*'}.${
      to ?? '*'
    }.${assetId ?? '*'}` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns {ReceiptsTransferSubject} A new instance of ReceiptsTransferSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns {ReceiptsTransferSubject} A new instance of ReceiptsTransferSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the 'from' contract ID for the subject.
   * @param {ContractId | null} from - The 'from' contract ID to set.
   * @returns {ReceiptsTransferSubject} A new instance of ReceiptsTransferSubject with the updated 'from' contract ID.
   */
  withFrom(from: ContractId | null) {
    return this.with('from', from);
  }

  /**
   * Sets the 'to' contract ID for the subject.
   * @param {ContractId | null} to - The 'to' contract ID to set.
   * @returns {ReceiptsTransferSubject} A new instance of ReceiptsTransferSubject with the updated 'to' contract ID.
   */
  withTo(to: ContractId | null) {
    return this.with('to', to);
  }

  /**
   * Sets the asset ID for the subject.
   * @param {AssetId | null} assetId - The asset ID to set.
   * @returns {ReceiptsTransferSubject} A new instance of ReceiptsTransferSubject with the updated asset ID.
   */
  withAssetId(assetId: AssetId | null) {
    return this.with('assetId', assetId);
  }
}

/**
 * Interface representing the fields for receipts return data.
 * @interface
 */
interface ReceiptsReturnDataFields {
  /** The transaction ID */
  txId: Bytes32;
  /** The index of the receipt */
  index: number;
  /** The contract ID */
  id: ContractId;
}

/**
 * Subject class for receipts return data.
 * @extends {SubjectBase<ReceiptsReturnDataFields>}
 */
export class ReceiptsReturnDataSubject extends SubjectBase<ReceiptsReturnDataFields> {
  /**
   * Parses the subject fields into a string.
   * @returns {string} The parsed subject string.
   */
  parse() {
    const { txId, index, id } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.return_data.${
      id ?? '*'
    }` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns {ReceiptsReturnDataSubject} A new instance of ReceiptsReturnDataSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns {ReceiptsReturnDataSubject} A new instance of ReceiptsReturnDataSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the contract ID for the subject.
   * @param {ContractId | null} id - The contract ID to set.
   * @returns {ReceiptsReturnDataSubject} A new instance of ReceiptsReturnDataSubject with the updated contract ID.
   */
  withId(id: ContractId | null) {
    return this.with('id', id);
  }
}

/**
 * Interface representing the fields for receipts panic.
 * @interface
 */
interface ReceiptsPanicFields {
  /** The transaction ID */
  txId: Bytes32;
  /** The index of the receipt */
  index: number;
  /** The contract ID */
  id: ContractId;
}

/**
 * Subject class for receipts panic.
 * @extends {SubjectBase<ReceiptsPanicFields>}
 */
export class ReceiptsPanicSubject extends SubjectBase<ReceiptsPanicFields> {
  /**
   * Parses the subject fields into a string.
   * @returns {string} The parsed subject string.
   */
  parse() {
    const { txId, index, id } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.panic.${
      id ?? '*'
    }` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns {ReceiptsPanicSubject} A new instance of ReceiptsPanicSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns {ReceiptsPanicSubject} A new instance of ReceiptsPanicSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the contract ID for the subject.
   * @param {ContractId | null} id - The contract ID to set.
   * @returns {ReceiptsPanicSubject} A new instance of ReceiptsPanicSubject with the updated contract ID.
   */
  withId(id: ContractId | null) {
    return this.with('id', id);
  }
}

/**
 * Interface representing the fields for receipts revert.
 * @interface
 */
interface ReceiptsRevertFields {
  /** The transaction ID */
  txId: Bytes32;
  /** The index of the receipt */
  index: number;
  /** The contract ID */
  id: ContractId;
}

/**
 * Subject class for receipts revert.
 * @extends {SubjectBase<ReceiptsRevertFields>}
 */
export class ReceiptsRevertSubject extends SubjectBase<ReceiptsRevertFields> {
  /**
   * Parses the subject fields into a string.
   * @returns {string} The parsed subject string.
   */
  parse() {
    const { txId, index, id } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.revert.${
      id ?? '*'
    }` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns {ReceiptsRevertSubject} A new instance of ReceiptsRevertSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns {ReceiptsRevertSubject} A new instance of ReceiptsRevertSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the contract ID for the subject.
   * @param {ContractId | null} id - The contract ID to set.
   * @returns {ReceiptsRevertSubject} A new instance of ReceiptsRevertSubject with the updated contract ID.
   */
  withId(id: ContractId | null) {
    return this.with('id', id);
  }
}

/**
 * Interface representing the fields for receipts log.
 * @interface
 */
interface ReceiptsLogFields {
  /** The transaction ID */
  txId: Bytes32;
  /** The index of the receipt */
  index: number;
  /** The contract ID */
  id: ContractId;
}

/**
 * Subject class for receipts log.
 * @extends {SubjectBase<ReceiptsLogFields>}
 */
export class ReceiptsLogSubject extends SubjectBase<ReceiptsLogFields> {
  /**
   * Parses the subject fields into a string.
   * @returns {string} The parsed subject string.
   */
  parse() {
    const { txId, index, id } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.log.${id ?? '*'}` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns {ReceiptsLogSubject} A new instance of ReceiptsLogSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns {ReceiptsLogSubject} A new instance of ReceiptsLogSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the contract ID for the subject.
   * @param {ContractId | null} id - The contract ID to set.
   * @returns {ReceiptsLogSubject} A new instance of ReceiptsLogSubject with the updated contract ID.
   */
  withId(id: ContractId | null) {
    return this.with('id', id);
  }
}

/**
 * Interface representing the fields for receipts log data.
 * @interface
 */
interface ReceiptsLogDataFields {
  /** The transaction ID */
  txId: Bytes32;
  /** The index of the receipt */
  index: number;
  /** The contract ID */
  id: ContractId;
}

/**
 * Subject class for receipts log data.
 * @extends {SubjectBase<ReceiptsLogDataFields>}
 */
export class ReceiptsLogDataSubject extends SubjectBase<ReceiptsLogDataFields> {
  /**
   * Parses the subject fields into a string.
   * @returns {string} The parsed subject string.
   */
  parse() {
    const { txId, index, id } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.log_data.${
      id ?? '*'
    }` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns {ReceiptsLogDataSubject} A new instance of ReceiptsLogDataSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns {ReceiptsLogDataSubject} A new instance of ReceiptsLogDataSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the contract ID for the subject.
   * @param {ContractId | null} id - The contract ID to set.
   * @returns {ReceiptsLogDataSubject} A new instance of ReceiptsLogDataSubject with the updated contract ID.
   */
  withId(id: ContractId | null) {
    return this.with('id', id);
  }
}

/**
 * Interface representing the fields for receipts script result.
 * @interface
 */
interface ReceiptsScriptResultFields {
  /** The transaction ID */
  txId: Bytes32;
  /** The index of the receipt */
  index: number;
}

/**
 * Subject class for receipts script result.
 * @extends {SubjectBase<ReceiptsScriptResultFields>}
 */
export class ReceiptsScriptResultSubject extends SubjectBase<ReceiptsScriptResultFields> {
  /**
   * Parses the subject fields into a string.
   * @returns {string} The parsed subject string.
   */
  parse() {
    const { txId, index } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.script_result` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns {ReceiptsScriptResultSubject} A new instance of ReceiptsScriptResultSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns {ReceiptsScriptResultSubject} A new instance of ReceiptsScriptResultSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }
}

/**
 * Interface representing the fields for receipts message out.
 * @interface
 */
interface ReceiptsMessageOutFields {
  /** The transaction ID */
  txId: Bytes32;
  /** The index of the receipt */
  index: number;
  /** The sender's address */
  sender: Address;
  /** The recipient's address */
  recipient: Address;
}

/**
 * Subject class for receipts message out.
 * @extends {SubjectBase<ReceiptsMessageOutFields>}
 */
export class ReceiptsMessageOutSubject extends SubjectBase<ReceiptsMessageOutFields> {
  /**
   * Parses the subject fields into a string.
   * @returns {string} The parsed subject string.
   */
  parse() {
    const { txId, index, sender, recipient } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.message_out.${
      sender ?? '*'
    }.${recipient ?? '*'}` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns {ReceiptsMessageOutSubject} A new instance of ReceiptsMessageOutSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns {ReceiptsMessageOutSubject} A new instance of ReceiptsMessageOutSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the sender's address for the subject.
   * @param {Address | null} sender - The sender's address to set.
   * @returns {ReceiptsMessageOutSubject} A new instance of ReceiptsMessageOutSubject with the updated sender's address.
   */
  withSender(sender: Address | null) {
    return this.with('sender', sender);
  }

  /**
   * Sets the recipient's address for the subject.
   * @param {Address | null} recipient - The recipient's address to set.
   * @returns {ReceiptsMessageOutSubject} A new instance of ReceiptsMessageOutSubject with the updated recipient's address.
   */
  withRecipient(recipient: Address | null) {
    return this.with('recipient', recipient);
  }
}

/**
 * Interface representing the fields for receipts mint.
 * @interface
 */
interface ReceiptsMintFields {
  /** The transaction ID */
  txId: Bytes32;
  /** The index of the receipt */
  index: number;
  /** The contract ID */
  contractId: ContractId;
  /** The sub-identifier */
  subId: Bytes32;
}

/**
 * Subject class for receipts mint.
 * @extends {SubjectBase<ReceiptsMintFields>}
 */
export class ReceiptsMintSubject extends SubjectBase<ReceiptsMintFields> {
  /**
   * Parses the subject fields into a string.
   * @returns {string} The parsed subject string.
   */
  parse() {
    const { txId, index, contractId, subId } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.mint.${contractId ?? '*'}.${
      subId ?? '*'
    }` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns {ReceiptsMintSubject} A new instance of ReceiptsMintSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns {ReceiptsMintSubject} A new instance of ReceiptsMintSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the contract ID for the subject.
   * @param {ContractId | null} contractId - The contract ID to set.
   * @returns {ReceiptsMintSubject} A new instance of ReceiptsMintSubject with the updated contract ID.
   */
  withContractId(contractId: ContractId | null) {
    return this.with('contractId', contractId);
  }

  /**
   * Sets the sub-identifier for the subject.
   * @param {Bytes32 | null} subId - The sub-identifier to set.
   * @returns {ReceiptsMintSubject} A new instance of ReceiptsMintSubject with the updated sub-identifier.
   */
  withSubId(subId: Bytes32 | null) {
    return this.with('subId', subId);
  }
}

/**
 * Interface representing the fields for receipts burn.
 * @interface
 */
interface ReceiptsBurnFields {
  /** The transaction ID */
  txId: Bytes32;
  /** The index of the receipt */
  index: number;
  /** The contract ID */
  contractId: ContractId;
  /** The sub-identifier */
  subId: Bytes32;
}

/**
 * Subject class for receipts burn.
 * @extends {SubjectBase<ReceiptsBurnFields>}
 */
export class ReceiptsBurnSubject extends SubjectBase<ReceiptsBurnFields> {
  /**
   * Parses the subject fields into a string.
   * @returns {string} The parsed subject string.
   */
  parse() {
    const { txId, index, contractId, subId } = this.fields;
    return `receipts.${txId ?? '*'}.${index ?? '*'}.burn.${contractId ?? '*'}.${
      subId ?? '*'
    }` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns {ReceiptsBurnSubject} A new instance of ReceiptsBurnSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns {ReceiptsBurnSubject} A new instance of ReceiptsBurnSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the contract ID for the subject.
   * @param {ContractId | null} contractId - The contract ID to set.
   * @returns {ReceiptsBurnSubject} A new instance of ReceiptsBurnSubject with the updated contract ID.
   */
  withContractId(contractId: ContractId | null) {
    return this.with('contractId', contractId);
  }

  /**
   * Sets the sub-identifier for the subject.
   * @param subId - The sub-identifier to set.
   * @returns A new instance of ReceiptsBurnSubject with the updated sub-identifier.
   */
  withSubId(subId: Bytes32 | null) {
    return this.with('subId', subId);
  }
}
