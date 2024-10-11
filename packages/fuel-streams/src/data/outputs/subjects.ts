import type { Address, AssetId, Bytes32, ContractId, IdentifierKind } from '..';
import { SubjectBase } from '../../streams/subject';

/**
 * Enum representing wildcards for outputs.
 * @enum {string}
 *
 * @example
 * // Using the All wildcard
 * const allOutputs = OutputsWildcard.All;
 * console.log(allOutputs); // 'outputs.>'
 *
 * // Using the ById wildcard
 * const outputsById = OutputsWildcard.ById;
 * console.log(outputsById); // 'by_id.outputs.>'
 */
export enum OutputsWildcard {
  /** Wildcard for all outputs */
  All = 'outputs.>',
  /** Wildcard for outputs by ID */
  ById = 'by_id.outputs.>',
}

/**
 * Interface representing the fields for outputs by ID.
 * @interface
 */
interface OutputsByIdFields {
  /** The kind of identifier */
  idKind: IdentifierKind;
  /** The value of the identifier */
  idValue: Bytes32;
}

/**
 * Subject class for outputs by ID.
 * @extends {SubjectBase<OutputsByIdFields>}
 *
 * @example
 * const subject = new OutputsByIdSubject()
 *   .withIdKind('B256')
 *   .withIdValue('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
 * console.log(subject.parse()); // 'by_id.outputs.B256.0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
 */
export class OutputsByIdSubject extends SubjectBase<OutputsByIdFields> {
  /**
   * Parses the fields into a string representation.
   * @returns {string} A string representation of the outputs by ID.
   */
  parse() {
    const { idKind, idValue } = this.fields;
    return `by_id.outputs.${idKind ?? '*'}.${idValue ?? '*'}` as const;
  }

  /**
   * Sets the ID kind for the subject.
   * @param {IdentifierKind | null} idKind - The ID kind to set, or null to unset.
   * @returns {OutputsByIdSubject} A new instance of OutputsByIdSubject with the updated ID kind.
   */
  withIdKind(idKind: IdentifierKind | null) {
    return this.with('idKind', idKind);
  }

  /**
   * Sets the ID value for the subject.
   * @param {Bytes32 | null} idValue - The ID value to set, or null to unset.
   * @returns {OutputsByIdSubject} A new instance of OutputsByIdSubject with the updated ID value.
   */
  withIdValue(idValue: Bytes32 | null) {
    return this.with('idValue', idValue);
  }
}

/**
 * Interface representing the fields for outputs.
 * @interface
 */
export interface OutputsFields {
  /** The transaction ID */
  txId: Bytes32;
  /** The index of the output */
  index: number;
}

/**
 * Generic subject class for outputs.
 * @template T
 * @extends {SubjectBase<T>}
 *
 * @example
 * const subject = new OutputsSubject<OutputsFields>()
 *   .withTxId('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
 *   .withIndex(0);
 * console.log(subject.parse()); // 'outputs.0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef.0.>'
 */
export class OutputsSubject<T extends OutputsFields> extends SubjectBase<T> {
  /**
   * Parses the fields into a string representation.
   * @returns {string} A string representation of the outputs.
   */
  parse() {
    const { txId, index } = this.fields;
    return `outputs.${txId ?? '*'}.${index ?? '*'}.>` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set, or null to unset.
   * @returns {OutputsSubject<T>} A new instance of OutputsSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set, or null to unset.
   * @returns {OutputsSubject<T>} A new instance of OutputsSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }
}

/**
 * Interface representing the fields for coin outputs.
 * @interface
 * @extends {OutputsFields}
 */
interface OutputsCoinFields extends OutputsFields {
  /** The recipient address */
  to: Address;
  /** The asset ID */
  assetId: AssetId;
}

/**
 * Subject class for coin outputs.
 * @extends {SubjectBase<OutputsCoinFields>}
 *
 * @example
 * const subject = new OutputsCoinSubject()
 *   .withTxId('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
 *   .withIndex(0)
 *   .withTo('fuel1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsx2tme')
 *   .withAssetId('0x0000000000000000000000000000000000000000000000000000000000000000');
 * console.log(subject.parse()); // 'outputs.coin.0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef.0.fuel1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsx2tme.0x0000000000000000000000000000000000000000000000000000000000000000'
 */
export class OutputsCoinSubject extends SubjectBase<OutputsCoinFields> {
  /**
   * Parses the fields into a string representation.
   * @returns {string} A string representation of the coin outputs.
   */
  parse() {
    const { txId, index, to, assetId } = this.fields;
    return `outputs.coin.${txId ?? '*'}.${index ?? '*'}.${to ?? '*'}.${
      assetId ?? '*'
    }` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set, or null to unset.
   * @returns {OutputsCoinSubject} A new instance of OutputsCoinSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set, or null to unset.
   * @returns {OutputsCoinSubject} A new instance of OutputsCoinSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the recipient address for the subject.
   * @param {Address | null} to - The recipient address to set, or null to unset.
   * @returns {OutputsCoinSubject} A new instance of OutputsCoinSubject with the updated recipient address.
   */
  withTo(to: Address | null) {
    return this.with('to', to);
  }

  /**
   * Sets the asset ID for the subject.
   * @param {AssetId | null} assetId - The asset ID to set, or null to unset.
   * @returns {OutputsCoinSubject} A new instance of OutputsCoinSubject with the updated asset ID.
   */
  withAssetId(assetId: AssetId | null) {
    return this.with('assetId', assetId);
  }
}

/**
 * Interface representing the fields for contract outputs.
 * @interface
 * @extends {OutputsFields}
 */
interface OutputsContractFields extends OutputsFields {
  /** The contract ID */
  contractId: ContractId;
}

/**
 * Subject class for contract outputs.
 * @extends {SubjectBase<OutputsContractFields>}
 *
 * @example
 * const subject = new OutputsContractSubject()
 *   .withTxId('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
 *   .withIndex(0)
 *   .withContractId('0x0000000000000000000000000000000000000000000000000000000000000000');
 * console.log(subject.parse()); // 'outputs.contract.0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef.0.0x0000000000000000000000000000000000000000000000000000000000000000'
 */
export class OutputsContractSubject extends SubjectBase<OutputsContractFields> {
  /**
   * Parses the fields into a string representation.
   * @returns {string} A string representation of the contract outputs.
   */
  parse() {
    const { txId, index, contractId } = this.fields;
    return `outputs.contract.${txId ?? '*'}.${index ?? '*'}.${
      contractId ?? '*'
    }` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set, or null to unset.
   * @returns {OutputsContractSubject} A new instance of OutputsContractSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set, or null to unset.
   * @returns {OutputsContractSubject} A new instance of OutputsContractSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the contract ID for the subject.
   * @param {ContractId | null} contractId - The contract ID to set, or null to unset.
   * @returns {OutputsContractSubject} A new instance of OutputsContractSubject with the updated contract ID.
   */
  withContractId(contractId: ContractId | null) {
    return this.with('contractId', contractId);
  }
}

/**
 * Interface representing the fields for change outputs.
 * @interface
 * @extends {OutputsFields}
 */
interface OutputsChangeFields extends OutputsFields {
  /** The recipient address */
  to: Address;
  /** The asset ID */
  assetId: AssetId;
}

/**
 * Subject class for change outputs.
 * @extends {SubjectBase<OutputsChangeFields>}
 *
 * @example
 * const subject = new OutputsChangeSubject()
 *   .withTxId('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
 *   .withIndex(0)
 *   .withTo('fuel1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsx2tme')
 *   .withAssetId('0x0000000000000000000000000000000000000000000000000000000000000000');
 * console.log(subject.parse()); // 'outputs.change.0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef.0.fuel1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsx2tme.0x0000000000000000000000000000000000000000000000000000000000000000'
 */
export class OutputsChangeSubject extends SubjectBase<OutputsChangeFields> {
  /**
   * Parses the fields into a string representation.
   * @returns {string} A string representation of the change outputs.
   */
  parse() {
    const { txId, index, to, assetId } = this.fields;
    return `outputs.change.${txId ?? '*'}.${index ?? '*'}.${to ?? '*'}.${
      assetId ?? '*'
    }` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set, or null to unset.
   * @returns {OutputsChangeSubject} A new instance of OutputsChangeSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set, or null to unset.
   * @returns {OutputsChangeSubject} A new instance of OutputsChangeSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the recipient address for the subject.
   * @param {Address | null} to - The recipient address to set, or null to unset.
   * @returns {OutputsChangeSubject} A new instance of OutputsChangeSubject with the updated recipient address.
   */
  withTo(to: Address | null) {
    return this.with('to', to);
  }

  /**
   * Sets the asset ID for the subject.
   * @param {AssetId | null} assetId - The asset ID to set, or null to unset.
   * @returns {OutputsChangeSubject} A new instance of OutputsChangeSubject with the updated asset ID.
   */
  withAssetId(assetId: AssetId | null) {
    return this.with('assetId', assetId);
  }
}

/**
 * Interface representing the fields for variable outputs.
 * @interface
 * @extends {OutputsFields}
 */
interface OutputsVariableFields extends OutputsFields {
  /** The recipient address */
  to: Address;
  /** The asset ID */
  assetId: AssetId;
}

/**
 * Subject class for variable outputs.
 * @extends {SubjectBase<OutputsVariableFields>}
 *
 * @example
 * const subject = new OutputsVariableSubject()
 *   .withTxId('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
 *   .withIndex(0)
 *   .withTo('fuel1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsx2tme')
 *   .withAssetId('0x0000000000000000000000000000000000000000000000000000000000000000');
 * console.log(subject.parse()); // 'outputs.variable.0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef.0.fuel1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsx2tme.0x0000000000000000000000000000000000000000000000000000000000000000'
 */
export class OutputsVariableSubject extends SubjectBase<OutputsVariableFields> {
  /**
   * Parses the fields into a string representation.
   * @returns {string} A string representation of the variable outputs.
   */
  parse() {
    const { txId, index, to, assetId } = this.fields;
    return `outputs.variable.${txId ?? '*'}.${index ?? '*'}.${to ?? '*'}.${
      assetId ?? '*'
    }` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set, or null to unset.
   * @returns {OutputsVariableSubject} A new instance of OutputsVariableSubject with the updated transaction ID.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set, or null to unset.
   * @returns {OutputsVariableSubject} A new instance of OutputsVariableSubject with the updated index.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the recipient address for the subject.
   * @param {Address | null} to - The recipient address to set, or null to unset.
   * @returns {OutputsVariableSubject} A new instance of OutputsVariableSubject with the updated recipient address.
   */
  withTo(to: Address | null) {
    return this.with('to', to);
  }

  /**
   * Sets the asset ID for the subject.
   * @param {AssetId | null} assetId - The asset ID to set, or null to unset.
   * @returns {OutputsVariableSubject} A new instance of OutputsVariableSubject with the updated asset ID.
   */
  withAssetId(assetId: AssetId | null) {
    return this.with('assetId', assetId);
  }
}
