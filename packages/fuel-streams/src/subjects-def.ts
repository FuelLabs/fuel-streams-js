export const TransactionTypeOptions = [
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

export const messageTypeOptions = [
  { value: 'imported', label: 'Imported' },
  { value: 'consumed', label: 'Consumed' },
] as const;

export const messageStatusOptions = [
  { value: 'spent', label: 'Spent' },
  { value: 'unspent', label: 'Unspent' },
] as const;

export const utxoTypeOptions = [
  { value: 'input_contract', label: 'Input Contract' },
  { value: 'input_coin', label: 'Input Coin' },
  { value: 'output_change', label: 'Output Change' },
  { value: 'output_variable', label: 'Output Variable' },
  { value: 'output_contract_created', label: 'Output Contract Created' },
] as const;

export const utxoStatusOptions = [
  { value: 'spent', label: 'Spent' },
  { value: 'unspent', label: 'Unspent' },
] as const;

export const inputTypeOptions = [
  { value: 'coin', label: 'Coin' },
  { value: 'contract', label: 'Contract' },
  { value: 'message', label: 'Message' },
] as const;

export const outputTypeOptions = [
  { value: 'coin', label: 'Coin' },
  { value: 'contract', label: 'Contract' },
  { value: 'change', label: 'Change' },
  { value: 'variable', label: 'Variable' },
  { value: 'contract_created', label: 'Contract Created' },
] as const;

export const receiptTypeOptions = [
  { value: 'call', label: 'Call' },
  { value: 'return', label: 'Return' },
  { value: 'return_data', label: 'Return Data' },
  { value: 'panic', label: 'Panic' },
  { value: 'revert', label: 'Revert' },
  { value: 'log', label: 'Log' },
  { value: 'log_data', label: 'Log Data' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'transfer_out', label: 'Transfer Out' },
  { value: 'script_result', label: 'Script Result' },
  { value: 'message_out', label: 'Message Out' },
  { value: 'mint', label: 'Mint' },
  { value: 'burn', label: 'Burn' },
] as const;

export type SelectOption = {
  value: string;
  label: string;
};

export type FieldOptions = {
  type: string;
  description?: string;
  options?: SelectOption[];
};

export type FormField = {
  id: string;
  type: string;
  options?: SelectOption[];
  value?: string;
  description?: string;
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
    format: 'blocks.{producer}.{da_height}.{height}',
    wildcard: 'blocks.>',
    fields: {
      producer: {
        type: 'Address',
        description: 'The address of the producer that created the block',
      },
      da_height: {
        type: 'DaBlockHeight',
        description: 'The height of the DA block as unsigned 64 bit integer',
      },
      height: {
        type: 'BlockHeight',
        description: 'The height of the block as unsigned 64 bit integer',
      },
    },
  },
  transactions: {
    id: 'transactions',
    entity: 'Transaction',
    subject: 'TransactionsSubject',
    format: 'transactions.{block_height}.{tx_id}.{tx_index}.{status}.{tx_type}',
    wildcard: 'transactions.>',
    fields: {
      block_height: {
        type: 'BlockHeight',
        description: 'The height of the block containing this transaction',
      },
      tx_id: {
        type: 'TxId',
        description:
          'The ID of the transaction (32 byte string prefixed by 0x)',
      },
      tx_index: {
        type: 'i32',
        description: 'The index of the transaction within the block',
      },
      status: {
        type: 'TransactionStatus',
        description:
          'The status of the transaction (success, failure, or submitted)',
      },
      tx_type: {
        type: 'TransactionType',
        description: 'The type of transaction (create, mint, script)',
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
      input_type: {
        type: 'InputType',
        description: 'The type of input (coin, contract, or message)',
      },
      block_height: {
        type: 'BlockHeight',
        description: 'The height of the block containing this input',
      },
      tx_id: {
        type: 'TxId',
        description:
          'The ID of the transaction containing this input (32 byte string prefixed by 0x)',
      },
      tx_index: {
        type: 'i32',
        description: 'The index of the transaction within the block',
      },
      input_index: {
        type: 'i32',
        description: 'The index of this input within the transaction',
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
          block_height: {
            type: 'BlockHeight',
            description: 'The height of the block containing this coin input',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this coin input (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          input_index: {
            type: 'i32',
            description: 'The index of this input within the transaction',
          },
          owner: {
            type: 'Address',
            description:
              'The address of the coin owner (32 byte string prefixed by 0x)',
          },
          asset: {
            type: 'AssetId',
            description:
              'The asset ID of the coin (32 byte string prefixed by 0x)',
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
          block_height: {
            type: 'BlockHeight',
            description:
              'The height of the block containing this contract input',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this contract input (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          input_index: {
            type: 'i32',
            description: 'The index of this input within the transaction',
          },
          contract: {
            type: 'ContractId',
            description:
              'The ID of the contract being called (32 byte string prefixed by 0x)',
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
            description:
              'The height of the block containing this message input',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this message input (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          input_index: {
            type: 'i32',
            description: 'The index of this input within the transaction',
          },
          sender: {
            type: 'Address',
            description:
              'The address that sent the message (32 byte string prefixed by 0x)',
          },
          recipient: {
            type: 'Address',
            description:
              'The address that will receive the message (32 byte string prefixed by 0x)',
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
      output_type: {
        type: 'OutputType',
        description:
          'The type of output (coin, contract, change, variable, or contract_created)',
      },
      block_height: {
        type: 'BlockHeight',
        description: 'The height of the block containing this output',
      },
      tx_id: {
        type: 'TxId',
        description:
          'The ID of the transaction containing this output (32 byte string prefixed by 0x)',
      },
      tx_index: {
        type: 'i32',
        description: 'The index of the transaction within the block',
      },
      output_index: {
        type: 'i32',
        description: 'The index of this output within the transaction',
      },
    },
    variants: {
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
            description: 'The height of the block containing this coin output',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this coin output (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          output_index: {
            type: 'i32',
            description: 'The index of this output within the transaction',
          },
          to: {
            type: 'Address',
            description:
              'The recipient address of the coin output (32 byte string prefixed by 0x)',
          },
          asset: {
            type: 'AssetId',
            description:
              'The asset ID of the coin (32 byte string prefixed by 0x)',
          },
        },
      },
      contract: {
        id: 'outputs_contract',
        entity: 'Output',
        subject: 'OutputsContractSubject',
        format:
          'outputs.contract.{block_height}.{tx_id}.{tx_index}.{output_index}.{contract}',
        wildcard: 'outputs.contract.>',
        fields: {
          block_height: {
            type: 'BlockHeight',
            description:
              'The height of the block containing this contract output',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this contract output (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          output_index: {
            type: 'i32',
            description: 'The index of this output within the transaction',
          },
          contract: {
            type: 'ContractId',
            description:
              'The ID of the contract (32 byte string prefixed by 0x)',
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
            description:
              'The height of the block containing this change output',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this change output (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          output_index: {
            type: 'i32',
            description: 'The index of this output within the transaction',
          },
          to: {
            type: 'Address',
            description:
              'The recipient address of the change output (32 byte string prefixed by 0x)',
          },
          asset: {
            type: 'AssetId',
            description:
              'The asset ID of the change output (32 byte string prefixed by 0x)',
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
          block_height: {
            type: 'BlockHeight',
            description:
              'The height of the block containing this variable output',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this variable output (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          output_index: {
            type: 'i32',
            description: 'The index of this output within the transaction',
          },
          to: {
            type: 'Address',
            description:
              'The recipient address of the variable output (32 byte string prefixed by 0x)',
          },
          asset: {
            type: 'AssetId',
            description:
              'The asset ID of the variable output (32 byte string prefixed by 0x)',
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
          block_height: {
            type: 'BlockHeight',
            description:
              'The height of the block containing this contract creation output',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this contract creation output (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          output_index: {
            type: 'i32',
            description: 'The index of this output within the transaction',
          },
          contract: {
            type: 'ContractId',
            description:
              'The ID of the created contract (32 byte string prefixed by 0x)',
          },
        },
      },
    },
  },
  predicates: {
    id: 'predicates',
    entity: 'Predicate',
    subject: 'PredicatesSubject',
    format:
      'predicates.{block_height}.{tx_id}.{tx_index}.{input_index}.{blob_id}.{predicate_address}.{asset}',
    wildcard: 'predicates.>',
    fields: {
      block_height: {
        type: 'BlockHeight',
        description: 'The height of the block containing this predicate',
      },
      tx_id: {
        type: 'TxId',
        description:
          'The ID of the transaction containing this predicate (32 byte string prefixed by 0x)',
      },
      tx_index: {
        type: 'i32',
        description: 'The index of the transaction within the block',
      },
      input_index: {
        type: 'i32',
        description:
          'The index of this input within the transaction that had this predicate',
      },
      blob_id: {
        type: 'HexData',
        description: 'The ID of the blob containing the predicate bytecode',
      },
      predicate_address: {
        type: 'Address',
        description:
          'The address of the predicate (32 byte string prefixed by 0x)',
      },
      asset: {
        type: 'AssetId',
        description: 'The asset ID of the coin (32 byte string prefixed by 0x)',
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
      receipt_type: {
        type: 'ReceiptType',
        description: 'The type of receipt',
      },
      block_height: {
        type: 'BlockHeight',
        description: 'The height of the block containing this receipt',
      },
      tx_id: {
        type: 'TxId',
        description:
          'The ID of the transaction containing this receipt (32 byte string prefixed by 0x)',
      },
      tx_index: {
        type: 'i32',
        description: 'The index of the transaction within the block',
      },
      receipt_index: {
        type: 'i32',
        description: 'The index of this receipt within the transaction',
      },
    },
    variants: {
      call: {
        id: 'receipts_call',
        entity: 'Receipt',
        subject: 'ReceiptsCallSubject',
        format:
          'receipts.call.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{from}.{to}.{asset}',
        wildcard: 'receipts.call.>',
        fields: {
          block_height: {
            type: 'BlockHeight',
            description: 'The height of the block containing this call receipt',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this call receipt (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          receipt_index: {
            type: 'i32',
            description: 'The index of this receipt within the transaction',
          },
          from: {
            type: 'ContractId',
            description:
              'The contract ID that initiated the call (32 byte string prefixed by 0x)',
          },
          to: {
            type: 'ContractId',
            description:
              'The contract ID that was called (32 byte string prefixed by 0x)',
          },
          asset: {
            type: 'AssetId',
            description:
              'The asset ID involved in the call (32 byte string prefixed by 0x)',
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
          block_height: {
            type: 'BlockHeight',
            description:
              'The height of the block containing this return receipt',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this return receipt (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          receipt_index: {
            type: 'i32',
            description: 'The index of this receipt within the transaction',
          },
          contract: {
            type: 'ContractId',
            description:
              'The ID of the contract that returned (32 byte string prefixed by 0x)',
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
          block_height: {
            type: 'BlockHeight',
            description:
              'The height of the block containing this return data receipt',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this return data receipt (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          receipt_index: {
            type: 'i32',
            description: 'The index of this receipt within the transaction',
          },
          contract: {
            type: 'ContractId',
            description:
              'The ID of the contract that returned data (32 byte string prefixed by 0x)',
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
          block_height: {
            type: 'BlockHeight',
            description:
              'The height of the block containing this panic receipt',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this panic receipt (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          receipt_index: {
            type: 'i32',
            description: 'The index of this receipt within the transaction',
          },
          contract: {
            type: 'ContractId',
            description:
              'The ID of the contract that panicked (32 byte string prefixed by 0x)',
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
          block_height: {
            type: 'BlockHeight',
            description:
              'The height of the block containing this revert receipt',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this revert receipt (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          receipt_index: {
            type: 'i32',
            description: 'The index of this receipt within the transaction',
          },
          contract: {
            type: 'ContractId',
            description:
              'The ID of the contract that reverted (32 byte string prefixed by 0x)',
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
            description: 'The height of the block containing this log receipt',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this log receipt (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          receipt_index: {
            type: 'i32',
            description: 'The index of this receipt within the transaction',
          },
          contract: {
            type: 'ContractId',
            description:
              'The ID of the contract that emitted the log (32 byte string prefixed by 0x)',
          },
        },
      },
      log_data: {
        id: 'receipts_log_data',
        entity: 'Receipt',
        subject: 'ReceiptsLogDataSubject',
        format:
          'receipts.log_data.{block_height}.{tx_id}.{tx_index}.{receipt_index}.{contract}',
        wildcard: 'receipts.log_data.>',
        fields: {
          block_height: {
            type: 'BlockHeight',
            description:
              'The height of the block containing this log data receipt',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this log data receipt (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          receipt_index: {
            type: 'i32',
            description: 'The index of this receipt within the transaction',
          },
          contract: {
            type: 'ContractId',
            description:
              'The ID of the contract that emitted the log data (32 byte string prefixed by 0x)',
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
          block_height: {
            type: 'BlockHeight',
            description:
              'The height of the block containing this transfer receipt',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this transfer receipt (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          receipt_index: {
            type: 'i32',
            description: 'The index of this receipt within the transaction',
          },
          from: {
            type: 'ContractId',
            description:
              'The contract ID that initiated the transfer (32 byte string prefixed by 0x)',
          },
          to: {
            type: 'ContractId',
            description:
              'The contract ID that received the transfer (32 byte string prefixed by 0x)',
          },
          asset: {
            type: 'AssetId',
            description:
              'The asset ID being transferred (32 byte string prefixed by 0x)',
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
          block_height: {
            type: 'BlockHeight',
            description:
              'The height of the block containing this transfer out receipt',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this transfer out receipt (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          receipt_index: {
            type: 'i32',
            description: 'The index of this receipt within the transaction',
          },
          from: {
            type: 'ContractId',
            description:
              'The contract ID that initiated the transfer out (32 byte string prefixed by 0x)',
          },
          to_address: {
            type: 'Address',
            description:
              'The address that received the transfer (32 byte string prefixed by 0x)',
          },
          asset: {
            type: 'AssetId',
            description:
              'The asset ID being transferred (32 byte string prefixed by 0x)',
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
          block_height: {
            type: 'BlockHeight',
            description:
              'The height of the block containing this script result receipt',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this script result receipt (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          receipt_index: {
            type: 'i32',
            description: 'The index of this receipt within the transaction',
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
            description:
              'The height of the block containing this message out receipt',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this message out receipt (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          receipt_index: {
            type: 'i32',
            description: 'The index of this receipt within the transaction',
          },
          sender: {
            type: 'Address',
            description:
              'The address that sent the message (32 byte string prefixed by 0x)',
          },
          recipient: {
            type: 'Address',
            description:
              'The address that will receive the message (32 byte string prefixed by 0x)',
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
            description: 'The height of the block containing this mint receipt',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this mint receipt (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          receipt_index: {
            type: 'i32',
            description: 'The index of this receipt within the transaction',
          },
          contract: {
            type: 'ContractId',
            description:
              'The ID of the contract that performed the mint (32 byte string prefixed by 0x)',
          },
          sub_id: {
            type: 'Bytes32',
            description:
              'The sub identifier of the minted asset (32 byte string prefixed by 0x)',
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
          block_height: {
            type: 'BlockHeight',
            description: 'The height of the block containing this burn receipt',
          },
          tx_id: {
            type: 'TxId',
            description:
              'The ID of the transaction containing this burn receipt (32 byte string prefixed by 0x)',
          },
          tx_index: {
            type: 'i32',
            description: 'The index of the transaction within the block',
          },
          receipt_index: {
            type: 'i32',
            description: 'The index of this receipt within the transaction',
          },
          contract: {
            type: 'ContractId',
            description:
              'The ID of the contract that performed the burn (32 byte string prefixed by 0x)',
          },
          sub_id: {
            type: 'Bytes32',
            description:
              'The sub identifier of the burned asset (32 byte string prefixed by 0x)',
          },
        },
      },
    },
  },
  utxos: {
    id: 'utxos',
    entity: 'Utxo',
    subject: 'UtxosSubject',
    format:
      'utxos.{block_height}.{tx_id}.{tx_index}.{output_index}.{status}.{utxo_type}.{asset_id}.{utxo_id}.{from}.{to}.{contract_id}',
    wildcard: 'utxos.>',
    fields: {
      block_height: {
        type: 'BlockHeight',
        description: 'The height of the block containing this UTXO',
      },
      tx_id: {
        type: 'TxId',
        description:
          'The ID of the transaction containing this UTXO (32 byte string prefixed by 0x)',
      },
      tx_index: {
        type: 'i32',
        description: 'The index of the transaction within the block',
      },
      output_index: {
        type: 'i32',
        description: 'The index of the output within the transaction',
      },
      utxo_type: {
        type: 'UtxoType',
        description: 'The type of UTXO (coin, message, or contract)',
      },
      asset_id: {
        type: 'AssetId',
        description: 'The ID of the asset associated with this UTXO',
      },
      utxo_id: {
        type: 'UtxoId',
        description:
          'The unique identifier for this UTXO (32 byte string prefixed by 0x)',
      },
      from: {
        type: 'Address',
        description:
          'The address of the sender (32 byte string prefixed by 0x)',
      },
      to: {
        type: 'Address',
        description:
          'The address of the recipient (32 byte string prefixed by 0x)',
      },
      contract_id: {
        type: 'ContractId',
        description:
          'The ID of the contract that returned (32 byte string prefixed by 0x)',
      },
      status: {
        type: 'UtxoStatus',
        description: 'The status of the UTXO (unspent or spent)',
      },
    },
  },
  messages: {
    id: 'messages',
    entity: 'Message',
    subject: 'MessagesSubject',
    format:
      'messages.{message_type}.{block_height}.{message_index}.{sender}.{recipient}.{nonce}',
    wildcard: 'messages.>',
    fields: {
      message_type: {
        type: 'MessageType',
        description: 'The type of message (imported or consumed)',
      },
      block_height: {
        type: 'BlockHeight',
        description: 'The height of the block containing this message',
      },
      message_index: {
        type: 'i32',
        description: 'The index of the message within the block',
      },
      sender: {
        type: 'Address',
        description:
          'The address that sent the message (32 byte string prefixed by 0x)',
      },
      recipient: {
        type: 'Address',
        description:
          'The address that will receive the message (32 byte string prefixed by 0x)',
      },
      nonce: {
        type: 'Nonce',
        description: 'The nonce of the message (32 byte string prefixed by 0x)',
      },
    },
  },
} as const;

export type ModuleKeys = keyof SubjectsDefinition;
