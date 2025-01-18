export const transactionKindOptions = [
  { value: 'create', label: 'Create' },
  { value: 'mint', label: 'Mint' },
  { value: 'script', label: 'Script' },
  { value: 'upgrade', label: 'Upgrade' },
  { value: 'upload', label: 'Upload' },
  { value: 'blob', label: 'Blob' },
] as const;

export const transactionStatusOptions = [
  { value: 'failed', label: 'Failed' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'squeezed_out', label: 'Squeezed Out' },
  { value: 'success', label: 'Success' },
] as const;

export const utxoTypeOptions = [
  { value: 'contract', label: 'Contract' },
  { value: 'coin', label: 'Coin' },
  { value: 'message', label: 'Message' },
] as const;

export type SelectOption = {
  value: string;
  label: string;
};

export type FieldOptions = {
  type: string;
  options?: SelectOption[];
};

export type FormField = {
  id: string;
  type: string;
  options?: SelectOption[];
  value?: string;
};

export type Fields = {
  [key: string]: FieldOptions;
};

export type Schema = {
  id: string;
  entity: string;
  subject: string;
  format: string;
  wildcard: string;
  fields: Fields;
  variants?: {
    [key: string]: Schema;
  };
};

export type SubjectsDefinition = {
  [key: string]: Schema;
};

export const subjectsDefinitions: SubjectsDefinition = {
  blocks: {
    id: 'blocks',
    entity: 'Block',
    subject: 'BlocksSubject',
    format: 'blocks.{producer}.{height}',
    wildcard: 'blocks.>',
    fields: {
      producer: {
        type: 'Address',
      },
      height: {
        type: 'BlockHeight',
      },
    },
  },
  transactions: {
    id: 'transactions',
    entity: 'Transaction',
    subject: 'TransactionsSubject',
    format: 'transactions.{block_height}.{tx_id}.{tx_index}.{tx_status}.{kind}',
    wildcard: 'transactions.>',
    fields: {
      block_height: {
        type: 'BlockHeight',
      },
      tx_index: {
        type: 'u32',
      },
      tx_status: {
        type: 'TransactionStatus',
      },
      kind: {
        type: 'TransactionKind',
      },
      tx_id: {
        type: 'TxId',
      },
    },
  },
  utxos: {
    id: 'utxos',
    entity: 'Utxo',
    subject: 'UtxosSubject',
    format:
      'utxos.{block_height}.{tx_id}.{tx_index}.{input_index}.{utxo_type}.{utxo_id}',
    wildcard: 'utxos.>',
    fields: {
      utxo_id: {
        type: 'HexData',
      },
      input_index: {
        type: 'u32',
      },
      tx_id: {
        type: 'TxId',
      },
      tx_index: {
        type: 'u32',
      },
      utxo_type: {
        type: 'UtxoType',
      },
      block_height: {
        type: 'BlockHeight',
      },
    },
  },
  inputs: {
    id: 'inputs',
    entity: 'Input',
    subject: 'InputsSubject',
    format:
      'inputs.{input_type}.{block_height}.{tx_id}.{tx_index}.{input_index}',
    wildcard: 'inputs.>',
    fields: {
      input_index: {
        type: 'u32',
      },
      tx_id: {
        type: 'TxId',
      },
      block_height: {
        type: 'BlockHeight',
      },
      tx_index: {
        type: 'u32',
      },
      input_type: {
        type: 'String',
      },
    },
    variants: {
      coin: {
        id: 'inputs_coin',
        entity: 'Input',
        subject: 'InputsCoinSubject',
        format:
          'inputs.coin.{block_height}.{tx_id}.{tx_index}.{input_index}.{owner}.{asset}',
        wildcard: 'inputs.coin.>',
        fields: {
          tx_id: {
            type: 'TxId',
          },
          asset: {
            type: 'AssetId',
          },
          owner: {
            type: 'Address',
          },
          block_height: {
            type: 'BlockHeight',
          },
          tx_index: {
            type: 'u32',
          },
          input_index: {
            type: 'u32',
          },
        },
      },
      message: {
        id: 'inputs_message',
        entity: 'Input',
        subject: 'InputsMessageSubject',
        format:
          'inputs.message.{block_height}.{tx_id}.{tx_index}.{input_index}.{sender}.{recipient}',
        wildcard: 'inputs.message.>',
        fields: {
          block_height: {
            type: 'BlockHeight',
          },
          input_index: {
            type: 'u32',
          },
          recipient: {
            type: 'Address',
          },
          sender: {
            type: 'Address',
          },
          tx_id: {
            type: 'TxId',
          },
          tx_index: {
            type: 'u32',
          },
        },
      },
      contract: {
        id: 'inputs_contract',
        entity: 'Input',
        subject: 'InputsContractSubject',
        format:
          'inputs.contract.{block_height}.{tx_id}.{tx_index}.{input_index}.{contract}',
        wildcard: 'inputs.contract.>',
        fields: {
          tx_id: {
            type: 'TxId',
          },
          input_index: {
            type: 'u32',
          },
          block_height: {
            type: 'BlockHeight',
          },
          tx_index: {
            type: 'u32',
          },
          contract: {
            type: 'ContractId',
          },
        },
      },
    },
  },
  receipts: {
    id: 'receipts',
    entity: 'Receipt',
    subject: 'ReceiptsSubject',
    format:
      'receipts.{receipt_type}.{block_height}.{tx_id}.{tx_index}.{receipt_index}',
    wildcard: 'receipts.>',
    fields: {
      receipt_index: {
        type: 'u32',
      },
      tx_id: {
        type: 'TxId',
      },
      receipt_type: {
        type: 'String',
      },
      tx_index: {
        type: 'u32',
      },
      block_height: {
        type: 'BlockHeight',
      },
    },
    variants: {
      log_data: {
        id: 'receipts_log_data',
        entity: 'Receipt',
        subject: 'ReceiptsLogDataSubject',
        format:
          'receipts.log_data.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}',
        wildcard: 'receipts.log_data.>',
        fields: {
          tx_index: {
            type: 'u32',
          },
          tx_id: {
            type: 'TxId',
          },
          contract: {
            type: 'ContractId',
          },
          receipt_index: {
            type: 'u32',
          },
          block_height: {
            type: 'BlockHeight',
          },
        },
      },
      panic: {
        id: 'receipts_panic',
        entity: 'Receipt',
        subject: 'ReceiptsPanicSubject',
        format:
          'receipts.panic.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}',
        wildcard: 'receipts.panic.>',
        fields: {
          receipt_index: {
            type: 'u32',
          },
          tx_index: {
            type: 'u32',
          },
          tx_id: {
            type: 'TxId',
          },
          contract: {
            type: 'ContractId',
          },
          block_height: {
            type: 'BlockHeight',
          },
        },
      },
      message_out: {
        id: 'receipts_message_out',
        entity: 'Receipt',
        subject: 'ReceiptsMessageOutSubject',
        format:
          'receipts.message_out.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{sender}.{recipient}',
        wildcard: 'receipts.message_out.>',
        fields: {
          block_height: {
            type: 'BlockHeight',
          },
          tx_index: {
            type: 'u32',
          },
          sender: {
            type: 'Address',
          },
          tx_id: {
            type: 'TxId',
          },
          receipt_index: {
            type: 'u32',
          },
          recipient: {
            type: 'Address',
          },
        },
      },
      burn: {
        id: 'receipts_burn',
        entity: 'Receipt',
        subject: 'ReceiptsBurnSubject',
        format:
          'receipts.burn.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}.{sub_id}',
        wildcard: 'receipts.burn.>',
        fields: {
          tx_id: {
            type: 'TxId',
          },
          receipt_index: {
            type: 'u32',
          },
          contract: {
            type: 'ContractId',
          },
          sub_id: {
            type: 'Bytes32',
          },
          block_height: {
            type: 'BlockHeight',
          },
          tx_index: {
            type: 'u32',
          },
        },
      },
      mint: {
        id: 'receipts_mint',
        entity: 'Receipt',
        subject: 'ReceiptsMintSubject',
        format:
          'receipts.mint.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}.{sub_id}',
        wildcard: 'receipts.mint.>',
        fields: {
          block_height: {
            type: 'BlockHeight',
          },
          tx_id: {
            type: 'TxId',
          },
          sub_id: {
            type: 'Bytes32',
          },
          receipt_index: {
            type: 'u32',
          },
          contract: {
            type: 'ContractId',
          },
          tx_index: {
            type: 'u32',
          },
        },
      },
      call: {
        id: 'receipts_call',
        entity: 'Receipt',
        subject: 'ReceiptsCallSubject',
        format:
          'receipts.call.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{from}.{to}.{asset}',
        wildcard: 'receipts.call.>',
        fields: {
          tx_id: {
            type: 'TxId',
          },
          from: {
            type: 'ContractId',
          },
          block_height: {
            type: 'BlockHeight',
          },
          tx_index: {
            type: 'u32',
          },
          receipt_index: {
            type: 'u32',
          },
          to: {
            type: 'ContractId',
          },
          asset: {
            type: 'AssetId',
          },
        },
      },
      return: {
        id: 'receipts_return',
        entity: 'Receipt',
        subject: 'ReceiptsReturnSubject',
        format:
          'receipts.return.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}',
        wildcard: 'receipts.return.>',
        fields: {
          tx_id: {
            type: 'TxId',
          },
          block_height: {
            type: 'BlockHeight',
          },
          tx_index: {
            type: 'u32',
          },
          receipt_index: {
            type: 'u32',
          },
          contract: {
            type: 'ContractId',
          },
        },
      },
      revert: {
        id: 'receipts_revert',
        entity: 'Receipt',
        subject: 'ReceiptsRevertSubject',
        format:
          'receipts.revert.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}',
        wildcard: 'receipts.revert.>',
        fields: {
          contract: {
            type: 'ContractId',
          },
          tx_index: {
            type: 'u32',
          },
          block_height: {
            type: 'BlockHeight',
          },
          tx_id: {
            type: 'TxId',
          },
          receipt_index: {
            type: 'u32',
          },
        },
      },
      return_data: {
        id: 'receipts_return_data',
        entity: 'Receipt',
        subject: 'ReceiptsReturnDataSubject',
        format:
          'receipts.return_data.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}',
        wildcard: 'receipts.return_data.>',
        fields: {
          contract: {
            type: 'ContractId',
          },
          tx_id: {
            type: 'TxId',
          },
          tx_index: {
            type: 'u32',
          },
          block_height: {
            type: 'BlockHeight',
          },
          receipt_index: {
            type: 'u32',
          },
        },
      },
      transfer: {
        id: 'receipts_transfer',
        entity: 'Receipt',
        subject: 'ReceiptsTransferSubject',
        format:
          'receipts.transfer.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{from}.{to}.{asset}',
        wildcard: 'receipts.transfer.>',
        fields: {
          tx_id: {
            type: 'TxId',
          },
          from: {
            type: 'ContractId',
          },
          tx_index: {
            type: 'u32',
          },
          to: {
            type: 'ContractId',
          },
          asset: {
            type: 'AssetId',
          },
          block_height: {
            type: 'BlockHeight',
          },
          receipt_index: {
            type: 'u32',
          },
        },
      },
      transfer_out: {
        id: 'receipts_transfer_out',
        entity: 'Receipt',
        subject: 'ReceiptsTransferOutSubject',
        format:
          'receipts.transfer_out.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{from}.{to_address}.{asset}',
        wildcard: 'receipts.transfer_out.>',
        fields: {
          to_address: {
            type: 'Address',
          },
          asset: {
            type: 'AssetId',
          },
          tx_index: {
            type: 'u32',
          },
          from: {
            type: 'ContractId',
          },
          receipt_index: {
            type: 'u32',
          },
          block_height: {
            type: 'BlockHeight',
          },
          tx_id: {
            type: 'TxId',
          },
        },
      },
      script_result: {
        id: 'receipts_script_result',
        entity: 'Receipt',
        subject: 'ReceiptsScriptResultSubject',
        format:
          'receipts.script_result.{block_height}.{tx_id}.{tx_index}.{receipt_index}',
        wildcard: 'receipts.script_result.>',
        fields: {
          tx_id: {
            type: 'TxId',
          },
          block_height: {
            type: 'BlockHeight',
          },
          tx_index: {
            type: 'u32',
          },
          receipt_index: {
            type: 'u32',
          },
        },
      },
      log: {
        id: 'receipts_log',
        entity: 'Receipt',
        subject: 'ReceiptsLogSubject',
        format:
          'receipts.log.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}',
        wildcard: 'receipts.log.>',
        fields: {
          block_height: {
            type: 'BlockHeight',
          },
          tx_id: {
            type: 'TxId',
          },
          tx_index: {
            type: 'u32',
          },
          receipt_index: {
            type: 'u32',
          },
          contract: {
            type: 'ContractId',
          },
        },
      },
    },
  },
  outputs: {
    id: 'outputs',
    entity: 'Output',
    subject: 'OutputsSubject',
    format:
      'outputs.{output_type}.{block_height}.{tx_id}.{tx_index}.{output_index}',
    wildcard: 'outputs.>',
    fields: {
      tx_index: {
        type: 'u32',
      },
      output_type: {
        type: 'String',
      },
      block_height: {
        type: 'BlockHeight',
      },
      tx_id: {
        type: 'TxId',
      },
      output_index: {
        type: 'u32',
      },
    },
    variants: {
      contract: {
        id: 'outputs_contract',
        entity: 'Output',
        subject: 'OutputsContractSubject',
        format:
          'outputs.contract.{block_height}.{tx_id}.{tx_index}.{output_index}.{contract}',
        wildcard: 'outputs.contract.>',
        fields: {
          tx_id: {
            type: 'TxId',
          },
          output_index: {
            type: 'u32',
          },
          block_height: {
            type: 'BlockHeight',
          },
          contract: {
            type: 'ContractId',
          },
          tx_index: {
            type: 'u32',
          },
        },
      },
      variable: {
        id: 'outputs_variable',
        entity: 'Output',
        subject: 'OutputsVariableSubject',
        format:
          'outputs.variable.{block_height}.{tx_id}.{tx_index}.{output_index}.{to}.{asset}',
        wildcard: 'outputs.variable.>',
        fields: {
          output_index: {
            type: 'u32',
          },
          block_height: {
            type: 'BlockHeight',
          },
          to: {
            type: 'Address',
          },
          asset: {
            type: 'AssetId',
          },
          tx_index: {
            type: 'u32',
          },
          tx_id: {
            type: 'TxId',
          },
        },
      },
      change: {
        id: 'outputs_change',
        entity: 'Output',
        subject: 'OutputsChangeSubject',
        format:
          'outputs.change.{block_height}.{tx_id}.{tx_index}.{output_index}.{to}.{asset}',
        wildcard: 'outputs.change.>',
        fields: {
          block_height: {
            type: 'BlockHeight',
          },
          asset: {
            type: 'AssetId',
          },
          tx_id: {
            type: 'TxId',
          },
          tx_index: {
            type: 'u32',
          },
          output_index: {
            type: 'u32',
          },
          to: {
            type: 'Address',
          },
        },
      },
      coin: {
        id: 'outputs_coin',
        entity: 'Output',
        subject: 'OutputsCoinSubject',
        format:
          'outputs.coin.{block_height}.{tx_id}.{tx_index}.{output_index}.{to}.{asset}',
        wildcard: 'outputs.coin.>',
        fields: {
          block_height: {
            type: 'BlockHeight',
          },
          output_index: {
            type: 'u32',
          },
          to: {
            type: 'Address',
          },
          tx_id: {
            type: 'TxId',
          },
          asset: {
            type: 'AssetId',
          },
          tx_index: {
            type: 'u32',
          },
        },
      },
      contract_created: {
        id: 'outputs_contract_created',
        entity: 'Output',
        subject: 'OutputsContractCreatedSubject',
        format:
          'outputs.contract_created.{block_height}.{tx_id}.{tx_index}.{output_index}.{contract}',
        wildcard: 'outputs.contract_created.>',
        fields: {
          output_index: {
            type: 'u32',
          },
          contract: {
            type: 'ContractId',
          },
          block_height: {
            type: 'BlockHeight',
          },
          tx_id: {
            type: 'TxId',
          },
          tx_index: {
            type: 'u32',
          },
        },
      },
    },
  },
} as const;

export type ModuleKeys = keyof SubjectsDefinition;
