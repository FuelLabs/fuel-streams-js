import type { Bytes32, IdentifierKind } from '..';
import { SubjectBase } from '../../streams/subject';

/**
 * Enum representing wildcards for input subjects.
 * @enum {string}
 *
 * @example
 * // Using the All wildcard
 * const allInputs = InputsWildcard.All;
 * console.log(allInputs); // 'inputs.>'
 */
export enum InputsWildcard {
  /** Matches all input subjects */
  All = 'inputs.>',
  /** Matches all input subjects by ID */
  ById = 'by_id.inputs.>',
}

/**
 * Interface defining the fields for an input by ID subject.
 * @interface
 */
interface InputsByIdFields {
  /** The kind of identifier */
  idKind: IdentifierKind;
  /** The value of the identifier */
  idValue: Bytes32;
}

/**
 * Class representing a subject for inputs by ID.
 * @extends {SubjectBase<InputsByIdFields>}
 *
 * @example
 * const subject = new InputsByIdSubject()
 *   .withIdKind(IdentifierKind.AssetID)
 *   .withIdValue('0x1234...5678');
 * console.log(subject.parse()); // 'by_id.inputs.asset_id.0x1234...5678'
 */
export class InputsByIdSubject extends SubjectBase<InputsByIdFields> {
  /**
   * Parses the fields into a subject string.
   * @returns The parsed subject string.
   */
  parse() {
    const { idKind, idValue } = this.fields;
    return `by_id.inputs.${idKind ?? '*'}.${idValue ?? '*'}` as const;
  }

  /**
   * Sets the ID kind for the subject.
   * @param {IdentifierKind | null} idKind - The ID kind to set.
   * @returns instance.
   */
  withIdKind(idKind: IdentifierKind | null) {
    return this.with('idKind', idKind);
  }

  /**
   * Sets the ID value for the subject.
   * @param {Bytes32 | null} idValue - The ID value to set.
   * @returns instance.
   */
  withIdValue(idValue: Bytes32 | null) {
    return this.with('idValue', idValue);
  }
}

/**
 * Interface defining the common fields for input subjects.
 * @interface
 */
interface InputsFields {
  /** The transaction ID */
  txId: Bytes32;
  /** The index of the input */
  index: number;
}

/**
 * Class representing a generic subject for inputs.
 * @extends {SubjectBase<T>}
 * @template T - Type extending {@link InputsFields}
 *
 * @example
 * const subject = new InputsSubject<InputsFields>()
 *   .withTxId('0xabcd...1234')
 *   .withIndex(2);
 * console.log(subject.parse()); // 'inputs.0xabcd...1234.2.>'
 */
export class InputsSubject<T extends InputsFields> extends SubjectBase<T> {
  /**
   * Parses the fields into a subject string.
   * @returns The parsed subject string.
   */
  parse() {
    const { txId, index } = this.fields;
    return `inputs.${txId ?? '*'}.${index ?? '*'}.>` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns instance.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns instance.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }
}

/**
 * Interface defining the fields for a coin input subject.
 * @interface
 * @extends {InputsFields}
 */
interface InputsCoinFields extends InputsFields {
  /** The owner of the coin */
  owner: Bytes32;
  /** The asset ID of the coin */
  assetId: Bytes32;
}

/**
 * Class representing a subject for coin inputs.
 * @extends {SubjectBase<InputsCoinFields>}
 *
 * @example
 * const subject = new InputsCoinSubject()
 *   .withTxId('0xabcd...1234')
 *   .withIndex(1)
 *   .withOwner('0xowner...address')
 *   .withAssetId('0xasset...id');
 * console.log(subject.parse()); // 'inputs.0xabcd...1234.1.coin.0xowner...address.0xasset...id'
 */
export class InputsCoinSubject extends SubjectBase<InputsCoinFields> {
  /**
   * Parses the fields into a subject string.
   * @returns The parsed subject string.
   */
  parse() {
    const { txId, index, owner, assetId } = this.fields;
    return `inputs.${txId ?? '*'}.${index ?? '*'}.coin.${owner ?? '*'}.${
      assetId ?? '*'
    }` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns instance.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns instance.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the owner for the subject.
   * @param {Bytes32 | null} owner - The owner to set.
   * @returns instance.
   */
  withOwner(owner: Bytes32 | null) {
    return this.with('owner', owner);
  }

  /**
   * Sets the asset ID for the subject.
   * @param {Bytes32 | null} assetId - The asset ID to set.
   * @returns instance.
   */
  withAssetId(assetId: Bytes32 | null) {
    return this.with('assetId', assetId);
  }
}

/**
 * Interface defining the fields for a contract input subject.
 * @interface
 * @extends {InputsFields}
 */
interface InputsContractFields extends InputsFields {
  /** The contract ID */
  contractId: Bytes32;
}

/**
 * Class representing a subject for contract inputs.
 * @extends {SubjectBase<InputsContractFields>}
 *
 * @example
 * const subject = new InputsContractSubject()
 *   .withTxId('0xabcd...1234')
 *   .withIndex(3)
 *   .withContractId('0xcontract...id');
 * console.log(subject.parse()); // 'inputs.0xabcd...1234.3.contract.0xcontract...id'
 */
export class InputsContractSubject extends SubjectBase<InputsContractFields> {
  /**
   * Parses the fields into a subject string.
   * @returns The parsed subject string.
   */
  parse() {
    const { txId, index, contractId } = this.fields;
    return `inputs.${txId ?? '*'}.${index ?? '*'}.contract.${
      contractId ?? '*'
    }` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns instance.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns instance.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the contract ID for the subject.
   * @param {Bytes32 | null} contractId - The contract ID to set.
   * @returns instance.
   */
  withContractId(contractId: Bytes32 | null) {
    return this.with('contractId', contractId);
  }
}

/**
 * Interface defining the fields for a message input subject.
 * @interface
 * @extends {InputsFields}
 */
interface InputsMessageFields extends InputsFields {
  /** The sender of the message */
  sender: Bytes32;
  /** The recipient of the message */
  recipient: Bytes32;
}

/**
 * Class representing a subject for message inputs.
 * @extends {SubjectBase<InputsMessageFields>}
 *
 * @example
 * const subject = new InputsMessageSubject()
 *   .withTxId('0xabcd...1234')
 *   .withIndex(4)
 *   .withSender('0xsender...address')
 *   .withRecipient('0xrecipient...address');
 * console.log(subject.parse()); // 'inputs.0xabcd...1234.4.message.0xsender...address.0xrecipient...address'
 */
export class InputsMessageSubject extends SubjectBase<InputsMessageFields> {
  /**
   * Parses the fields into a subject string.
   * @returns The parsed subject string.
   */
  parse() {
    const { txId, index, sender, recipient } = this.fields;
    return `inputs.${txId ?? '*'}.${index ?? '*'}.message.${sender ?? '*'}.${
      recipient ?? '*'
    }` as const;
  }

  /**
   * Sets the transaction ID for the subject.
   * @param {Bytes32 | null} txId - The transaction ID to set.
   * @returns instance.
   */
  withTxId(txId: Bytes32 | null) {
    return this.with('txId', txId);
  }

  /**
   * Sets the index for the subject.
   * @param {number | null} index - The index to set.
   * @returns instance.
   */
  withIndex(index: number | null) {
    return this.with('index', index);
  }

  /**
   * Sets the sender for the subject.
   * @param {Bytes32 | null} sender - The sender to set.
   * @returns instance.
   */
  withSender(sender: Bytes32 | null) {
    return this.with('sender', sender);
  }

  /**
   * Sets the recipient for the subject.
   * @param {Bytes32 | null} recipient - The recipient to set.
   * @returns instance.
   */
  withRecipient(recipient: Bytes32 | null) {
    return this.with('recipient', recipient);
  }
}
