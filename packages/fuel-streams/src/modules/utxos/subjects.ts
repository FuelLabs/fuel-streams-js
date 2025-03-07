/**
 * This file is auto-generated by scripts/generate-subjects.ts
 * Do not edit this file manually
 *
 * Generated Subjects:
 * - UtxosSubject
 */

import { UtxoParser } from '../../parsers';
import type {
  BlockHeight,
  ContractId,
  HexData,
  RawUtxo,
  TxId,
  Utxo,
  UtxoType,
} from '../../types';
import { SubjectBase } from '../subject-base';

type UtxosFields = {
  blockHeight: BlockHeight;
  txId: TxId;
  txIndex: number;
  inputIndex: number;
  utxoType: UtxoType;
  utxoId: HexData;
  contractId: ContractId;
};

export class UtxosSubject extends SubjectBase<UtxosFields, Utxo, RawUtxo> {
  metadata = {
    id: 'utxos',
    format:
      'utxos.{block_height}.{tx_id}.{tx_index}.{input_index}.{utxo_type}.{utxo_id}.{contract_id}',
    parser: new UtxoParser(),
  };
}
