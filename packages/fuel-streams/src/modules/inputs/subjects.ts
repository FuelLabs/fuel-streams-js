/**
 * This file is auto-generated by scripts/generate-subjects.ts
 * Do not edit this file manually
 *
 * Generated Subjects:
 * - InputsCoinSubject
 * - InputsMessageSubject
 * - InputsContractSubject
 */

import { InputParser } from '../../parsers';
import type { Input, RawInput } from '../../types';
import type {
  Address,
  AssetId,
  BlockHeight,
  ContractId,
  TxId,
} from '../../types';
import { SubjectBase } from '../subject-base';

type InputsCoinFields = {
  txId: TxId;
  asset: AssetId;
  owner: Address;
  blockHeight: BlockHeight;
  txIndex: number;
  inputIndex: number;
};

export class InputsCoinSubject extends SubjectBase<
  InputsCoinFields,
  Input,
  RawInput
> {
  metadata = {
    id: 'inputs_coin',
    format:
      'inputs.coin.{block_height}.{tx_id}.{tx_index}.{input_index}.{owner}.{asset}',
    parser: new InputParser(),
  };
}

type InputsMessageFields = {
  blockHeight: BlockHeight;
  inputIndex: number;
  recipient: Address;
  sender: Address;
  txId: TxId;
  txIndex: number;
};

export class InputsMessageSubject extends SubjectBase<
  InputsMessageFields,
  Input,
  RawInput
> {
  metadata = {
    id: 'inputs_message',
    format:
      'inputs.message.{block_height}.{tx_id}.{tx_index}.{input_index}.{sender}.{recipient}',
    parser: new InputParser(),
  };
}

type InputsContractFields = {
  txId: TxId;
  inputIndex: number;
  blockHeight: BlockHeight;
  txIndex: number;
  contract: ContractId;
};

export class InputsContractSubject extends SubjectBase<
  InputsContractFields,
  Input,
  RawInput
> {
  metadata = {
    id: 'inputs_contract',
    format:
      'inputs.contract.{block_height}.{tx_id}.{tx_index}.{input_index}.{contract}',
    parser: new InputParser(),
  };
}
