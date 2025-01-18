/**
 * This file is auto-generated by scripts/generate-subjects.ts
 * Do not edit this file manually
 */

import type {
  AddressLike,
  BN,
  BytesLike,
  ContractIdLike,
  AssetId as FuelAssetId,
  Block as FuelsBlock,
  Input as FuelsInput,
  InputCoin as FuelsInputCoin,
  InputContract as FuelsInputContract,
  InputMessage as FuelsInputMessage,
  Output as FuelsOutput,
  OutputChange as FuelsOutputChange,
  OutputCoin as FuelsOutputCoin,
  OutputContract as FuelsOutputContract,
  OutputContractCreated as FuelsOutputContractCreated,
  OutputVariable as FuelsOutputVariable,
  Receipt as FuelsReceipt,
  Transaction as FuelsTransaction,
  TransactionType,
} from 'fuels';

// ----------------------------------------------------------------------------
// Base Types
// ----------------------------------------------------------------------------
export type Bytes32 = BytesLike;
export type Address = AddressLike;
export type AssetId = FuelAssetId;
export type ContractId = ContractIdLike;
export type BlockHeight = number;
export type MessageId = string;
export type TxId = string;
export type HexData = string;

export type UtxoId = {
  txId: string;
  outputIndex: number;
};

export type TxPointer = {
  blockHeight: number;
  txIndex: number;
};

// ----------------------------------------------------------------------------
// Stream Types
// ----------------------------------------------------------------------------
export enum StreamNames {
  Blocks = 'blocks',
  Inputs = 'inputs',
  Outputs = 'outputs',
  Receipts = 'receipts',
  Transactions = 'transactions',
  Utxos = 'utxos',
}

export enum ClientStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Reconnecting = 'reconnecting',
  Disconnecting = 'disconnecting',
  Errored = 'errored',
  Stale = 'stale',
}

// ----------------------------------------------------------------------------
// Identifier Types
// ----------------------------------------------------------------------------
export enum IdentifierKind {
  AssetID = 'asset_id',
  ContractID = 'contract_id',
}

// ----------------------------------------------------------------------------
// Block Types
// ----------------------------------------------------------------------------
export type RawBlock = {
  id: string;
  height: number;
  time: string;
  transactionIds: string[];
  version: 'V1';
  consensus: {
    type: 'Genesis' | 'PoAConsensus';
    signature?: string;
    chainConfigHash?: string;
    coinsRoot?: string;
    contractsRoot?: string;
    messagesRoot?: string;
    transactionsRoot?: string;
  };
  header: {
    daHeight: number;
    stateTransitionBytecodeVersion: number;
    transactionsCount: number;
    transactionsRoot: string;
    messageOutboxRoot: string;
    eventInboxRoot: string;
    prevRoot: string;
    applicationHash: string;
    consensusParametersVersion: number;
    height: number;
    messageReceiptCount: number;
    time: string;
    version: 'V1';
    id: string;
  };
};

export type Block = FuelsBlock & {
  consensus: RawBlock['consensus'];
  version: RawBlock['version'];
};

// ----------------------------------------------------------------------------
// Output Types
// ----------------------------------------------------------------------------
export type RawCoinOutput = {
  type: 'Coin';
  amount: number;
  assetId: string;
  to: string;
};

export type RawContractOutput = {
  type: 'Contract';
  balanceRoot: string;
  stateRoot: string;
  inputIndex: number;
};

export type RawChangeOutput = {
  type: 'Change';
  amount: number;
  assetId: string;
  to: string;
};

export type RawVariableOutput = {
  type: 'Variable';
  amount: number;
  assetId: string;
  to: string;
};

export type RawContractCreated = {
  type: 'ContractCreated';
  contractId: string;
  stateRoot: string;
};

export type RawOutput =
  | RawCoinOutput
  | RawContractOutput
  | RawChangeOutput
  | RawVariableOutput
  | RawContractCreated;

export type OutputCoin = FuelsOutputCoin;
export type OutputContract = FuelsOutputContract;
export type OutputChange = FuelsOutputChange;
export type OutputVariable = FuelsOutputVariable;
export type OutputContractCreated = FuelsOutputContractCreated;
export type Output = FuelsOutput;
export { OutputType } from 'fuels';

// ----------------------------------------------------------------------------
// Input Types
// ----------------------------------------------------------------------------
export type RawInputCoin = {
  type: 'Coin';
  amount: number;
  assetId: string;
  owner: string;
  predicate: string;
  predicateData: string;
  predicateGasUsed: number;
  predicateDataLength: number;
  predicateLength: number;
  txPointer: TxPointer;
  utxoId: UtxoId;
  witnessIndex: number;
};

export type RawInputContract = {
  type: 'Contract';
  balanceRoot: string;
  stateRoot: string;
  txPointer: TxPointer;
  utxoId: UtxoId;
  contractId: string;
};

export type RawInputMessage = {
  type: 'Message';
  amount: number;
  data?: string;
  nonce: string;
  predicate: string;
  predicateData: string;
  predicateGasUsed: number;
  predicateDataLength: number;
  predicateLength: number;
  recipient: string;
  sender: string;
  witnessIndex: number;
};

export type RawInput = RawInputCoin | RawInputContract | RawInputMessage;
export type InputCoin = FuelsInputCoin;
export type InputContract = FuelsInputContract;
export type InputMessage = FuelsInputMessage;
export type Input = FuelsInput;
export { InputType } from 'fuels';

// ----------------------------------------------------------------------------
// Receipt Types
// ----------------------------------------------------------------------------
export type RawReceipt = {
  type:
    | 'Call'
    | 'Return'
    | 'ReturnData'
    | 'Panic'
    | 'Revert'
    | 'Log'
    | 'LogData'
    | 'Transfer'
    | 'TransferOut'
    | 'ScriptResult'
    | 'MessageOut'
    | 'Mint'
    | 'Burn';
  amount?: number;
  assetId?: string;
  contractId?: string;
  data?: string;
  digest?: string;
  gas?: number;
  gasUsed?: number;
  id?: string;
  is?: number;
  len?: number;
  nonce?: string;
  param1?: number;
  param2?: number;
  pc?: number;
  ptr?: number;
  ra?: number;
  rb?: number;
  rc?: number;
  rd?: number;
  reason?: number;
  recipient?: string;
  result?: number;
  sender?: string;
  subId?: string;
  to?: string;
  toAddress?: string;
  val?: number;
};

export type Receipt = FuelsReceipt;
export { ReceiptType } from 'fuels';

// ----------------------------------------------------------------------------
// UTXO Types
// ----------------------------------------------------------------------------
export type RawUtxo = {
  utxoId: UtxoId;
  sender?: string;
  recipient?: string;
  nonce?: string;
  data?: string;
  amount?: number;
  txId: string;
};

export type Utxo = {
  utxoId: UtxoId;
  sender?: string;
  recipient?: string;
  nonce?: string;
  data?: string;
  amount?: BN;
  txId: string;
};

export enum UtxoType {
  Contract = 'Contract',
  Coin = 'Coin',
  Message = 'Message',
}

// ----------------------------------------------------------------------------
// Transaction Types
// ----------------------------------------------------------------------------
export type RawTransaction = {
  id: string;
  type: TransactionType;
  bytecodeRoot?: string;
  bytecodeWitnessIndex?: number;
  blobId?: string;
  inputAssetIds?: string[];
  inputContract?: RawInputContract;
  inputContracts?: string[];
  inputs: RawInput[];
  outputContract?: RawContractOutput;
  outputs: RawOutput[];
  isCreate: boolean;
  isMint: boolean;
  isScript: boolean;
  isUpgrade: boolean;
  isUpload: boolean;
  maturity?: number;
  mintAmount?: number;
  mintAssetId?: string;
  mintGasPrice?: number;
  policies?: {
    maxFee: number;
    witnessLimit: number;
    maturity: number;
    maxSize: number;
  };
  proofSet: string[];
  rawPayload: string;
  receiptsRoot?: string;
  salt?: string;
  script?: string;
  scriptData?: string;
  scriptGasLimit?: number;
  status: TransactionStatus;
  storageSlots: { key: string; value: string }[];
  subsectionIndex?: number;
  subsectionsNumber?: number;
  txPointer?: TxPointer;
  upgradePurpose?: number;
  witnesses: string[];
  receipts: RawReceipt[];
};

export type Transaction = FuelsTransaction;
export { TransactionType } from 'fuels';

export enum TransactionKind {
  Create = 'create',
  Mint = 'mint',
  Script = 'script',
  Upgrade = 'upgrade',
  Upload = 'upload',
  Blob = 'blob',
}

export enum TransactionStatus {
  Failed = 'failed',
  Submitted = 'submitted',
  SqueezedOut = 'squeezedOut',
  Success = 'success',
  None = 'none',
}
