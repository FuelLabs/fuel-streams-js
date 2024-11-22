const byIdProps = {
  tx_id: {
    type: 'B256',
  },
  index: {
    type: 'u8',
  },
  id_kind: {
    type: 'IdentifierKind',
    options: [
      { value: 'address', label: 'Address' },
      { value: 'contract_id', label: 'Contract ID' },
      { value: 'asset_id', label: 'Asset ID' },
      { value: 'predicate_id', label: 'Predicate ID' },
      { value: 'script_id', label: 'Script ID' },
    ],
  },
  id_value: {
    type: 'B256',
  },
} as const;

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

export const subjectsDefinitions = {
  blocks: {
    name: 'Blocks',
    subject: 'BlocksSubject',
    format: 'blocks.{producer}.{height}',
    wildcard: 'blocks.>',
    props: {
      producer: {
        type: 'Address',
      },
      height: {
        type: 'BlockHeight',
      },
    },
  },
  inputs: {
    name: 'Inputs',
    wildcard: 'inputs.>',
    variants: {
      byId: {
        name: 'By ID',
        subject: 'InputsByIdSubject',
        format: 'by_id.inputs.{tx_id}.{index}.{id_kind}.{id_value}',
        wildcard: 'by_id.inputs.>',
        props: byIdProps,
      },
      generic: {
        name: 'Inputs Generic',
        subject: 'InputsSubject',
        format: 'inputs.{tx_id}.{index}.>',
        wildcard: 'inputs.>',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
        },
      },
      coin: {
        name: 'Coin Input',
        subject: 'InputsCoinSubject',
        format: 'inputs.{tx_id}.{index}.coin.{owner}.{asset_id}',
        wildcard: 'inputs.*.*.coin.*.*',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
          owner: {
            type: 'Address',
          },
          asset_id: {
            type: 'AssetId',
          },
        },
      },
      contract: {
        name: 'Contract Input',
        subject: 'InputsContractSubject',
        format: 'inputs.{tx_id}.{index}.contract.{contract_id}',
        wildcard: 'inputs.*.*.contract.*',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
          contract_id: {
            type: 'ContractId',
          },
        },
      },
      message: {
        name: 'Message Input',
        subject: 'InputsMessageSubject',
        format: 'inputs.{tx_id}.{index}.message.{sender}.{recipient}',
        wildcard: 'inputs.*.*.message.*.*',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
          sender: {
            type: 'Address',
          },
          recipient: {
            type: 'Address',
          },
        },
      },
    },
  },
  outputs: {
    name: 'Outputs',
    wildcard: 'outputs.>',
    variants: {
      byId: {
        name: 'By ID',
        subject: 'OutputsByIdSubject',
        format: 'by_id.outputs.{tx_id}.{index}.{id_kind}.{id_value}',
        wildcard: 'by_id.outputs.>',
        props: byIdProps,
      },
      generic: {
        name: 'Outputs Generic',
        subject: 'OutputsSubject',
        format: 'outputs.*.{tx_id}.{index}.>',
        wildcard: 'outputs.>',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
        },
      },
      coin: {
        name: 'Coin Output',
        subject: 'OutputsCoinSubject',
        format: 'outputs.coin.{tx_id}.{index}.{to}.{asset_id}',
        wildcard: 'outputs.coin.>',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'u16',
          },
          to: {
            type: 'Address',
          },
          asset_id: {
            type: 'AssetId',
          },
        },
      },
      contract: {
        name: 'Contract Output',
        subject: 'OutputsContractSubject',
        format: 'outputs.contract.{tx_id}.{index}.{contract_id}',
        wildcard: 'outputs.contract.>',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'u16',
          },
          contract_id: {
            type: 'ContractId',
          },
        },
      },
      change: {
        name: 'Change Output',
        subject: 'OutputsChangeSubject',
        format: 'outputs.change.{tx_id}.{index}.{to}.{asset_id}',
        wildcard: 'outputs.change.>',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'u16',
          },
          to: {
            type: 'Address',
          },
          asset_id: {
            type: 'AssetId',
          },
        },
      },
      variable: {
        name: 'Variable Output',
        subject: 'OutputsVariableSubject',
        format: 'outputs.variable.{tx_id}.{index}.{to}.{asset_id}',
        wildcard: 'outputs.variable.>',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'u16',
          },
          to: {
            type: 'Address',
          },
          asset_id: {
            type: 'AssetId',
          },
        },
      },
      contractCreated: {
        name: 'Contract Created Output',
        subject: 'OutputsContractCreatedSubject',
        format: 'outputs.contract_created.{tx_id}.{index}.{contract_id}',
        wildcard: 'outputs.contract_created.>',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'u16',
          },
          contract_id: {
            type: 'ContractId',
          },
        },
      },
    },
  },
  receipts: {
    name: 'Receipts',
    wildcard: 'receipts.>',
    variants: {
      byId: {
        name: 'By ID',
        subject: 'ReceiptsByIdSubject',
        format: 'by_id.receipts.{tx_id}.{index}.{id_kind}.{id_value}',
        wildcard: 'by_id.receipts.>',
        props: byIdProps,
      },
      generic: {
        name: 'Receipts Generic',
        subject: 'ReceiptsSubject',
        format: 'receipts.{tx_id}.{index}.>',
        wildcard: 'receipts.>',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
        },
      },
      call: {
        name: 'Call Receipt',
        subject: 'ReceiptsCallSubject',
        format: 'receipts.{tx_id}.{index}.call.{from}.{to}.{asset_id}',
        wildcard: 'receipts.*.*.call.*.*.*',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
          from: {
            type: 'ContractId',
          },
          to: {
            type: 'ContractId',
          },
          asset_id: {
            type: 'AssetId',
          },
        },
      },
      return: {
        name: 'Return Receipt',
        subject: 'ReceiptsReturnSubject',
        format: 'receipts.{tx_id}.{index}.return.{id}',
        wildcard: 'receipts.*.*.return.*',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
          id: {
            type: 'ContractId',
          },
        },
      },
      returnData: {
        name: 'Return Data Receipt',
        subject: 'ReceiptsReturnDataSubject',
        format: 'receipts.{tx_id}.{index}.return_data.{id}',
        wildcard: 'receipts.*.*.return_data.*',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
          id: {
            type: 'ContractId',
          },
        },
      },
      panic: {
        name: 'Panic Receipt',
        subject: 'ReceiptsPanicSubject',
        format: 'receipts.{tx_id}.{index}.panic.{id}',
        wildcard: 'receipts.*.*.panic.*',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
          id: {
            type: 'ContractId',
          },
        },
      },
      revert: {
        name: 'Revert Receipt',
        subject: 'ReceiptsRevertSubject',
        format: 'receipts.{tx_id}.{index}.revert.{id}',
        wildcard: 'receipts.*.*.revert.*',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
          id: {
            type: 'ContractId',
          },
        },
      },
      log: {
        name: 'Log Receipt',
        subject: 'ReceiptsLogSubject',
        format: 'receipts.{tx_id}.{index}.log.{id}',
        wildcard: 'receipts.*.*.log.*',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
          id: {
            type: 'ContractId',
          },
        },
      },
      logData: {
        name: 'Log Data Receipt',
        subject: 'ReceiptsLogDataSubject',
        format: 'receipts.{tx_id}.{index}.log_data.{id}',
        wildcard: 'receipts.*.*.log_data.*',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
          id: {
            type: 'ContractId',
          },
        },
      },
      transfer: {
        name: 'Transfer Receipt',
        subject: 'ReceiptsTransferSubject',
        format: 'receipts.{tx_id}.{index}.transfer.{from}.{to}.{asset_id}',
        wildcard: 'receipts.*.*.transfer.*.*.*',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
          from: {
            type: 'ContractId',
          },
          to: {
            type: 'ContractId',
          },
          asset_id: {
            type: 'AssetId',
          },
        },
      },
      transferOut: {
        name: 'Transfer Out Receipt',
        subject: 'ReceiptsTransferOutSubject',
        format: 'receipts.{tx_id}.{index}.transfer_out.{from}.{to}.{asset_id}',
        wildcard: 'receipts.*.*.transfer_out.*.*.*',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
          from: {
            type: 'ContractId',
          },
          to: {
            type: 'Address',
          },
          asset_id: {
            type: 'AssetId',
          },
        },
      },
      mint: {
        name: 'Mint Receipt',
        subject: 'ReceiptsMintSubject',
        format: 'receipts.{tx_id}.{index}.mint.{contract_id}.{sub_id}',
        wildcard: 'receipts.*.*.mint.*.*',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
          contract_id: {
            type: 'ContractId',
          },
          sub_id: {
            type: 'B256',
          },
        },
      },
      burn: {
        name: 'Burn Receipt',
        subject: 'ReceiptsBurnSubject',
        format: 'receipts.{tx_id}.{index}.burn.{contract_id}.{sub_id}',
        wildcard: 'receipts.*.*.burn.*.*',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
          contract_id: {
            type: 'ContractId',
          },
          sub_id: {
            type: 'B256',
          },
        },
      },
      scriptResult: {
        name: 'Script Result Receipt',
        subject: 'ReceiptsScriptResultSubject',
        format: 'receipts.{tx_id}.{index}.script_result',
        wildcard: 'receipts.*.*.script_result',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
        },
      },
      messageOut: {
        name: 'Message Out Receipt',
        subject: 'ReceiptsMessageOutSubject',
        format: 'receipts.{tx_id}.{index}.message_out.{sender}.{recipient}',
        wildcard: 'receipts.*.*.message_out.*.*',
        props: {
          tx_id: {
            type: 'B256',
          },
          index: {
            type: 'usize',
          },
          sender: {
            type: 'Address',
          },
          recipient: {
            type: 'Address',
          },
        },
      },
    },
  },
  transactions: {
    name: 'Transactions',
    wildcard: 'transactions.>',
    variants: {
      byId: {
        name: 'By ID',
        subject: 'TransactionsByIdSubject',
        format: 'by_id.transactions.{tx_id}.{index}.{id_kind}.{id_value}',
        wildcard: 'by_id.transactions.>',
        props: byIdProps,
      },
      generic: {
        name: 'Transaction',
        subject: 'TransactionsSubject',
        format: 'transactions.{block_height}.{index}.{tx_id}.{status}.{kind}',
        wildcard: 'transactions.>',
        props: {
          block_height: {
            type: 'BlockHeight',
          },
          index: {
            type: 'usize',
          },
          tx_id: {
            type: 'B256',
          },
          status: {
            type: 'TransactionStatus',
            options: transactionStatusOptions,
          },
          kind: {
            type: 'TransactionKind',
            options: transactionKindOptions,
          },
        },
      },
    },
  },
  logs: {
    name: 'Logs',
    subject: 'LogsSubject',
    format: 'logs.{block_height}.{tx_id}.{receipt_index}.{log_id}',
    wildcard: 'logs.>',
    props: {
      block_height: {
        type: 'BlockHeight',
      },
      tx_id: {
        type: 'B256',
      },
      receipt_index: {
        type: 'usize',
      },
      log_id: {
        type: 'B256',
      },
    },
  },
  utxos: {
    name: 'UTXOs',
    subject: 'UtxosSubject',
    format: 'utxos.{utxo_type}.{hash}',
    wildcard: 'utxos.>',
    props: {
      utxo_type: {
        type: 'UtxoType',
        options: utxoTypeOptions,
      },
      hash: {
        type: 'MessageId',
      },
    },
  },
} as const;

export type SelectOption = {
  value: string;
  label: string;
};

export type PropOptions = {
  type: string;
  options?: SelectOption[];
};

export type FormProp = {
  name: string;
  type: string;
  options?: SelectOption[];
  value?: string;
};

export type PropsObj = {
  [key: string]: PropOptions;
};

export type ModuleBase = {
  name: string;
  wildcard: string;
};

export type SimpleModule = ModuleBase & {
  subject: string;
  format: string;
  props: PropsObj;
};

export type VariantDefinition = {
  name: string;
  subject: string;
  format: string;
  wildcard: string;
  props: PropsObj;
};

export type VariantModule = ModuleBase & {
  variants: {
    [key: string]: VariantDefinition;
  };
};

export type ModuleType = SimpleModule | VariantModule;
export type SubjectsDefinition = typeof subjectsDefinitions;
export type ModuleKeys = keyof SubjectsDefinition;
