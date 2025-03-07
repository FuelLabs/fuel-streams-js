/**
 * This file is auto-generated by scripts/generate-subjects.ts
 * Do not edit this file manually
 *
 * Generated Subjects:
 * - ReceiptsSubject
 * - ReceiptsCallSubject
 * - ReceiptsReturnSubject
 * - ReceiptsReturnDataSubject
 * - ReceiptsPanicSubject
 * - ReceiptsRevertSubject
 * - ReceiptsLogSubject
 * - ReceiptsLogDataSubject
 * - ReceiptsTransferSubject
 * - ReceiptsTransferOutSubject
 * - ReceiptsScriptResultSubject
 * - ReceiptsMessageOutSubject
 * - ReceiptsMintSubject
 * - ReceiptsBurnSubject
 */

import { ReceiptParser } from '../../parsers';
import type {
  Address,
  AssetId,
  BlockHeight,
  Bytes32,
  ContractId,
  RawReceipt,
  Receipt,
  ReceiptType,
  TxId,
} from '../../types';
import { SubjectBase } from '../subject-base';

type ReceiptsFields = {
  receiptType: ReceiptType;
  blockHeight: BlockHeight;
  txId: TxId;
  txIndex: number;
  receiptIndex: number;
};

export class ReceiptsSubject extends SubjectBase<
  ReceiptsFields,
  Receipt,
  RawReceipt
> {
  metadata = {
    id: 'receipts',
    format:
      'receipts.{receipt_type}.{block_height}.{tx_id}.{tx_index}.{receipt_index}',
    parser: new ReceiptParser(),
  };
}

type ReceiptsCallFields = {
  blockHeight: BlockHeight;
  txId: TxId;
  txIndex: number;
  receiptIndex: number;
  from: ContractId;
  to: ContractId;
  asset: AssetId;
};

export class ReceiptsCallSubject extends SubjectBase<
  ReceiptsCallFields,
  Receipt,
  RawReceipt
> {
  metadata = {
    id: 'receipts_call',
    format:
      'receipts.call.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{from}.{to}.{asset}',
    parser: new ReceiptParser(),
  };
}

type ReceiptsReturnFields = {
  blockHeight: BlockHeight;
  txId: TxId;
  txIndex: number;
  receiptIndex: number;
  contract: ContractId;
};

export class ReceiptsReturnSubject extends SubjectBase<
  ReceiptsReturnFields,
  Receipt,
  RawReceipt
> {
  metadata = {
    id: 'receipts_return',
    format:
      'receipts.return.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}',
    parser: new ReceiptParser(),
  };
}

type ReceiptsReturnDataFields = {
  blockHeight: BlockHeight;
  txId: TxId;
  txIndex: number;
  receiptIndex: number;
  contract: ContractId;
};

export class ReceiptsReturnDataSubject extends SubjectBase<
  ReceiptsReturnDataFields,
  Receipt,
  RawReceipt
> {
  metadata = {
    id: 'receipts_return_data',
    format:
      'receipts.return_data.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}',
    parser: new ReceiptParser(),
  };
}

type ReceiptsPanicFields = {
  blockHeight: BlockHeight;
  txId: TxId;
  txIndex: number;
  receiptIndex: number;
  contract: ContractId;
};

export class ReceiptsPanicSubject extends SubjectBase<
  ReceiptsPanicFields,
  Receipt,
  RawReceipt
> {
  metadata = {
    id: 'receipts_panic',
    format:
      'receipts.panic.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}',
    parser: new ReceiptParser(),
  };
}

type ReceiptsRevertFields = {
  blockHeight: BlockHeight;
  txId: TxId;
  txIndex: number;
  receiptIndex: number;
  contract: ContractId;
};

export class ReceiptsRevertSubject extends SubjectBase<
  ReceiptsRevertFields,
  Receipt,
  RawReceipt
> {
  metadata = {
    id: 'receipts_revert',
    format:
      'receipts.revert.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}',
    parser: new ReceiptParser(),
  };
}

type ReceiptsLogFields = {
  blockHeight: BlockHeight;
  txId: TxId;
  txIndex: number;
  receiptIndex: number;
  contract: ContractId;
};

export class ReceiptsLogSubject extends SubjectBase<
  ReceiptsLogFields,
  Receipt,
  RawReceipt
> {
  metadata = {
    id: 'receipts_log',
    format:
      'receipts.log.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}',
    parser: new ReceiptParser(),
  };
}

type ReceiptsLogDataFields = {
  blockHeight: BlockHeight;
  txId: TxId;
  txIndex: number;
  receiptIndex: number;
  contract: ContractId;
};

export class ReceiptsLogDataSubject extends SubjectBase<
  ReceiptsLogDataFields,
  Receipt,
  RawReceipt
> {
  metadata = {
    id: 'receipts_log_data',
    format:
      'receipts.log_data.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}',
    parser: new ReceiptParser(),
  };
}

type ReceiptsTransferFields = {
  blockHeight: BlockHeight;
  txId: TxId;
  txIndex: number;
  receiptIndex: number;
  from: ContractId;
  to: ContractId;
  asset: AssetId;
};

export class ReceiptsTransferSubject extends SubjectBase<
  ReceiptsTransferFields,
  Receipt,
  RawReceipt
> {
  metadata = {
    id: 'receipts_transfer',
    format:
      'receipts.transfer.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{from}.{to}.{asset}',
    parser: new ReceiptParser(),
  };
}

type ReceiptsTransferOutFields = {
  blockHeight: BlockHeight;
  txId: TxId;
  txIndex: number;
  receiptIndex: number;
  from: ContractId;
  toAddress: Address;
  asset: AssetId;
};

export class ReceiptsTransferOutSubject extends SubjectBase<
  ReceiptsTransferOutFields,
  Receipt,
  RawReceipt
> {
  metadata = {
    id: 'receipts_transfer_out',
    format:
      'receipts.transfer_out.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{from}.{to_address}.{asset}',
    parser: new ReceiptParser(),
  };
}

type ReceiptsScriptResultFields = {
  blockHeight: BlockHeight;
  txId: TxId;
  txIndex: number;
  receiptIndex: number;
};

export class ReceiptsScriptResultSubject extends SubjectBase<
  ReceiptsScriptResultFields,
  Receipt,
  RawReceipt
> {
  metadata = {
    id: 'receipts_script_result',
    format:
      'receipts.script_result.{block_height}.{tx_id}.{tx_index}.{receipt_index}',
    parser: new ReceiptParser(),
  };
}

type ReceiptsMessageOutFields = {
  blockHeight: BlockHeight;
  txId: TxId;
  txIndex: number;
  receiptIndex: number;
  sender: Address;
  recipient: Address;
};

export class ReceiptsMessageOutSubject extends SubjectBase<
  ReceiptsMessageOutFields,
  Receipt,
  RawReceipt
> {
  metadata = {
    id: 'receipts_message_out',
    format:
      'receipts.message_out.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{sender}.{recipient}',
    parser: new ReceiptParser(),
  };
}

type ReceiptsMintFields = {
  blockHeight: BlockHeight;
  txId: TxId;
  txIndex: number;
  receiptIndex: number;
  contract: ContractId;
  subId: Bytes32;
};

export class ReceiptsMintSubject extends SubjectBase<
  ReceiptsMintFields,
  Receipt,
  RawReceipt
> {
  metadata = {
    id: 'receipts_mint',
    format:
      'receipts.mint.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}.{sub_id}',
    parser: new ReceiptParser(),
  };
}

type ReceiptsBurnFields = {
  blockHeight: BlockHeight;
  txId: TxId;
  txIndex: number;
  receiptIndex: number;
  contract: ContractId;
  subId: Bytes32;
};

export class ReceiptsBurnSubject extends SubjectBase<
  ReceiptsBurnFields,
  Receipt,
  RawReceipt
> {
  metadata = {
    id: 'receipts_burn',
    format:
      'receipts.burn.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}.{sub_id}',
    parser: new ReceiptParser(),
  };
}
