export const formStructure = {
  blocks: {
    name: 'Blocks',
    subject: 'BlocksSubject',
    fields: {
      producer: {
        type: 'Address',
        optional: true,
      },
      height: {
        type: 'BlockHeight',
        optional: true,
      },
    },
  },
  inputs: {
    name: 'Inputs',
    byId: {
      name: 'By ID',
      subject: 'InputsByIdSubject',
      fields: {
        id_kind: {
          type: 'IdentifierKind',
          optional: true,
        },
        id_value: {
          type: 'B256',
          optional: true,
        },
      },
    },
    variants: {
      coin: {
        name: 'Coin Input',
        subject: 'InputsCoinSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
          owner: {
            type: 'Address',
            optional: true,
          },
          asset_id: {
            type: 'AssetId',
            optional: true,
          },
        },
      },
      contract: {
        name: 'Contract Input',
        subject: 'InputsContractSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
          contract_id: {
            type: 'ContractId',
            optional: true,
          },
        },
      },
      message: {
        name: 'Message Input',
        subject: 'InputsMessageSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
          sender: {
            type: 'Address',
            optional: true,
          },
          recipient: {
            type: 'Address',
            optional: true,
          },
        },
      },
    },
  },
  outputs: {
    name: 'Outputs',
    byId: {
      name: 'By ID',
      subject: 'OutputsByIdSubject',
      fields: {
        id_kind: {
          type: 'IdentifierKind',
          optional: true,
        },
        id_value: {
          type: 'B256',
          optional: true,
        },
      },
    },
    variants: {
      coin: {
        name: 'Coin Output',
        subject: 'OutputsCoinSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'u16',
            optional: true,
          },
          to: {
            type: 'Address',
            optional: true,
          },
          asset_id: {
            type: 'AssetId',
            optional: true,
          },
        },
      },
      contract: {
        name: 'Contract Output',
        subject: 'OutputsContractSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'u16',
            optional: true,
          },
          contract_id: {
            type: 'ContractId',
            optional: true,
          },
        },
      },
      change: {
        name: 'Change Output',
        subject: 'OutputsChangeSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'u16',
            optional: true,
          },
          to: {
            type: 'Address',
            optional: true,
          },
          asset_id: {
            type: 'AssetId',
            optional: true,
          },
        },
      },
      variable: {
        name: 'Variable Output',
        subject: 'OutputsVariableSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'u16',
            optional: true,
          },
          to: {
            type: 'Address',
            optional: true,
          },
          asset_id: {
            type: 'AssetId',
            optional: true,
          },
        },
      },
      contractCreated: {
        name: 'Contract Created Output',
        subject: 'OutputsContractCreatedSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'u16',
            optional: true,
          },
          contract_id: {
            type: 'ContractId',
            optional: true,
          },
        },
      },
    },
  },
  receipts: {
    name: 'Receipts',
    byId: {
      name: 'By ID',
      subject: 'ReceiptsByIdSubject',
      fields: {
        id_kind: {
          type: 'IdentifierKind',
          optional: true,
        },
        id_value: {
          type: 'B256',
          optional: true,
        },
      },
    },
    variants: {
      call: {
        name: 'Call Receipt',
        subject: 'ReceiptsCallSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
          from: {
            type: 'ContractId',
            optional: true,
          },
          to: {
            type: 'ContractId',
            optional: true,
          },
          asset_id: {
            type: 'AssetId',
            optional: true,
          },
        },
      },
      return: {
        name: 'Return Receipt',
        subject: 'ReceiptsReturnSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
          id: {
            type: 'ContractId',
            optional: true,
          },
        },
      },
      returnData: {
        name: 'Return Data Receipt',
        subject: 'ReceiptsReturnDataSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
          id: {
            type: 'ContractId',
            optional: true,
          },
        },
      },
      panic: {
        name: 'Panic Receipt',
        subject: 'ReceiptsPanicSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
          id: {
            type: 'ContractId',
            optional: true,
          },
        },
      },
      revert: {
        name: 'Revert Receipt',
        subject: 'ReceiptsRevertSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
          id: {
            type: 'ContractId',
            optional: true,
          },
        },
      },
      log: {
        name: 'Log Receipt',
        subject: 'ReceiptsLogSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
          id: {
            type: 'ContractId',
            optional: true,
          },
        },
      },
      logData: {
        name: 'Log Data Receipt',
        subject: 'ReceiptsLogDataSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
          id: {
            type: 'ContractId',
            optional: true,
          },
        },
      },
      transfer: {
        name: 'Transfer Receipt',
        subject: 'ReceiptsTransferSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
          from: {
            type: 'ContractId',
            optional: true,
          },
          to: {
            type: 'ContractId',
            optional: true,
          },
          asset_id: {
            type: 'AssetId',
            optional: true,
          },
        },
      },
      transferOut: {
        name: 'Transfer Out Receipt',
        subject: 'ReceiptsTransferOutSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
          from: {
            type: 'ContractId',
            optional: true,
          },
          to: {
            type: 'Address',
            optional: true,
          },
          asset_id: {
            type: 'AssetId',
            optional: true,
          },
        },
      },
      mint: {
        name: 'Mint Receipt',
        subject: 'ReceiptsMintSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
          contract_id: {
            type: 'ContractId',
            optional: true,
          },
          sub_id: {
            type: 'B256',
            optional: true,
          },
        },
      },
      burn: {
        name: 'Burn Receipt',
        subject: 'ReceiptsBurnSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
          contract_id: {
            type: 'ContractId',
            optional: true,
          },
          sub_id: {
            type: 'B256',
            optional: true,
          },
        },
      },
      scriptResult: {
        name: 'Script Result Receipt',
        subject: 'ReceiptsScriptResultSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
        },
      },
      messageOut: {
        name: 'Message Out Receipt',
        subject: 'ReceiptsMessageOutSubject',
        fields: {
          tx_id: {
            type: 'B256',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
          sender: {
            type: 'Address',
            optional: true,
          },
          recipient: {
            type: 'Address',
            optional: true,
          },
        },
      },
    },
  },
  transactions: {
    name: 'Transactions',
    byId: {
      name: 'By ID',
      subject: 'TransactionsByIdSubject',
      fields: {
        id_kind: {
          type: 'IdentifierKind',
          optional: true,
        },
        id_value: {
          type: 'B256',
          optional: true,
        },
      },
    },
    variants: {
      transaction: {
        name: 'Transaction',
        subject: 'TransactionsSubject',
        fields: {
          block_height: {
            type: 'BlockHeight',
            optional: true,
          },
          index: {
            type: 'usize',
            optional: true,
          },
          tx_id: {
            type: 'B256',
            optional: true,
          },
          status: {
            type: 'TransactionStatus',
            optional: true,
          },
          kind: {
            type: 'TransactionKind',
            optional: true,
          },
        },
      },
    },
  },
  logs: {
    name: 'Logs',
    subject: 'LogsSubject',
    fields: {
      block_height: {
        type: 'BlockHeight',
        optional: true,
      },
      tx_id: {
        type: 'B256',
        optional: true,
      },
      receipt_index: {
        type: 'usize',
        optional: true,
      },
      log_id: {
        type: 'B256',
        optional: true,
      },
    },
  },
  utxos: {
    name: 'UTXOs',
    subject: 'UtxosSubject',
    fields: {
      hash: {
        type: 'MessageId',
        optional: true,
      },
      utxo_type: {
        type: 'UtxoType',
        optional: true,
      },
    },
  },
} as const;
