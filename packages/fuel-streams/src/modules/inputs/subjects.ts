/**
 * This file is auto-generated by scripts/generate-subjects.ts
 * Do not edit this file manually
 *
 * Generated Subjects:
 * - InputsByIdSubject
 * - InputsSubject
 * - InputsCoinSubject
 * - InputsContractSubject
 * - InputsMessageSubject
 */

import type {
  Address,
  AssetId,
  Bytes32,
  ContractId,
  IdentifierKind,
} from '../../types';
import { SubjectBase } from '../subject-base';

type InputsFields = {
  txId: Bytes32;
  index: number;
};

export class InputsSubject extends SubjectBase<InputsFields> {
  protected format = 'inputs.{tx_id}.{index}.>';
}

type InputsByIdFields = {
  txId: Bytes32;
  index: number;
  idKind: IdentifierKind;
  idValue: Bytes32;
};

export class InputsByIdSubject extends SubjectBase<InputsByIdFields> {
  protected format = 'by_id.inputs.{tx_id}.{index}.{id_kind}.{id_value}';
}

type InputsCoinFields = {
  txId: Bytes32;
  index: number;
  owner: Address;
  assetId: AssetId;
};

export class InputsCoinSubject extends SubjectBase<InputsCoinFields> {
  protected format = 'inputs.{tx_id}.{index}.coin.{owner}.{asset_id}';
}

type InputsContractFields = {
  txId: Bytes32;
  index: number;
  contractId: ContractId;
};

export class InputsContractSubject extends SubjectBase<InputsContractFields> {
  protected format = 'inputs.{tx_id}.{index}.contract.{contract_id}';
}

type InputsMessageFields = {
  txId: Bytes32;
  index: number;
  sender: Address;
  recipient: Address;
};

export class InputsMessageSubject extends SubjectBase<InputsMessageFields> {
  protected format = 'inputs.{tx_id}.{index}.message.{sender}.{recipient}';
}
