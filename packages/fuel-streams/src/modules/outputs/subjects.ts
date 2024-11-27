/**
 * This file is auto-generated by scripts/generate-subjects.ts
 * Do not edit this file manually
 *
 * Generated Subjects:
 * - OutputsByIdSubject
 * - OutputsSubject
 * - OutputsCoinSubject
 * - OutputsContractSubject
 * - OutputsChangeSubject
 * - OutputsVariableSubject
 * - OutputsContractCreatedSubject
 */

import type {
  Address,
  AssetId,
  Bytes32,
  ContractId,
  IdentifierKind,
} from '../../types';
import { SubjectBase } from '../subject-base';

type OutputsFields = {
  txId: Bytes32;
  index: number;
};

export class OutputsSubject extends SubjectBase<OutputsFields> {
  protected format = 'outputs.*.{tx_id}.{index}.>';
}

type OutputsByIdFields = {
  txId: Bytes32;
  index: number;
  idKind: IdentifierKind;
  idValue: Bytes32;
};

export class OutputsByIdSubject extends SubjectBase<OutputsByIdFields> {
  protected format = 'by_id.outputs.{tx_id}.{index}.{id_kind}.{id_value}';
}

type OutputsCoinFields = {
  txId: Bytes32;
  index: number;
  to: Address;
  assetId: AssetId;
};

export class OutputsCoinSubject extends SubjectBase<OutputsCoinFields> {
  protected format = 'outputs.coin.{tx_id}.{index}.{to}.{asset_id}';
}

type OutputsContractFields = {
  txId: Bytes32;
  index: number;
  contractId: ContractId;
};

export class OutputsContractSubject extends SubjectBase<OutputsContractFields> {
  protected format = 'outputs.contract.{tx_id}.{index}.{contract_id}';
}

type OutputsChangeFields = {
  txId: Bytes32;
  index: number;
  to: Address;
  assetId: AssetId;
};

export class OutputsChangeSubject extends SubjectBase<OutputsChangeFields> {
  protected format = 'outputs.change.{tx_id}.{index}.{to}.{asset_id}';
}

type OutputsVariableFields = {
  txId: Bytes32;
  index: number;
  to: Address;
  assetId: AssetId;
};

export class OutputsVariableSubject extends SubjectBase<OutputsVariableFields> {
  protected format = 'outputs.variable.{tx_id}.{index}.{to}.{asset_id}';
}

type OutputsContractCreatedFields = {
  txId: Bytes32;
  index: number;
  contractId: ContractId;
};

export class OutputsContractCreatedSubject extends SubjectBase<OutputsContractCreatedFields> {
  protected format = 'outputs.contract_created.{tx_id}.{index}.{contract_id}';
}
