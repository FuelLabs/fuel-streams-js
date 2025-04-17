import { Interface, type JsonAbi, bn as toBN } from 'fuels';
import { evolve } from 'ramda';
import snakify from 'snakify-ts';
import type { EntityParser } from './modules/subject-base';
import {
  type Block,
  type Input,
  type InputCoin,
  type InputContract,
  type InputMessage,
  InputType,
  type Output,
  type OutputChange,
  type OutputCoin,
  type OutputContract,
  type OutputContractCreated,
  OutputType,
  type OutputVariable,
  type Policies,
  type Predicate,
  type RawBlock,
  type RawCallReceipt,
  type RawChangeOutput,
  type RawCoinOutput,
  type RawContractCreated,
  type RawContractOutput,
  type RawInput,
  type RawInputCoin,
  type RawInputContract,
  type RawInputMessage,
  type RawLogDataReceipt,
  type RawLogReceipt,
  type RawMessageOutReceipt,
  type RawMintReceipt,
  type RawOutput,
  type RawPanicReceipt,
  type RawPredicate,
  type RawReceipt,
  type RawReturnDataReceipt,
  type RawReturnReceipt,
  type RawScriptResultReceipt,
  type RawTransaction,
  type RawTransferReceipt,
  type RawUtxo,
  type RawVariableOutput,
  type Receipt,
  ReceiptType,
  type Transaction,
  type TxPointer,
  type Utxo,
} from './types';
const safeToBN = (value: any) => (value != null ? toBN(value) : value);

export class BlockParser implements EntityParser<Block, RawBlock> {
  parse(data: RawBlock): Block {
    const transformations = {
      height: safeToBN,
      header: {
        daHeight: safeToBN,
        height: safeToBN,
        stateTransitionBytecodeVersion: safeToBN,
        consensusParametersVersion: safeToBN,
      },
    };
    return evolve(transformations, data) as unknown as Block;
  }
}

export class InputCoinParser {
  parse(data: RawInputCoin): InputCoin {
    const { utxoId, ...rest } = data;
    const transformations = {
      type: () => InputType.Coin,
      amount: safeToBN,
      predicateGasUsed: safeToBN,
    };

    return evolve(transformations, {
      ...rest,
      txID: utxoId.txId,
      outputIndex: utxoId.outputIndex,
      predicateDataLength: rest.predicateData?.length,
      predicateLength: rest.predicate?.length,
    }) as unknown as InputCoin;
  }
}

export class InputContractParser {
  parse(data: RawInputContract): InputContract {
    const { utxoId, ...rest } = data;
    const transformations = {
      type: () => InputType.Contract,
    };

    return evolve(transformations, {
      ...rest,
      txID: utxoId.txId,
      outputIndex: utxoId.outputIndex,
      contractID: rest.contractId,
      balanceRoot: rest.balanceRoot,
      stateRoot: rest.stateRoot,
    }) as unknown as InputContract;
  }
}

export class InputMessageParser {
  parse(data: RawInputMessage): InputMessage {
    const transformations = {
      type: () => InputType.Message,
      amount: safeToBN,
      predicateGasUsed: safeToBN,
    };

    return evolve(transformations, {
      ...data,
      predicateDataLength: data.predicateData?.length,
      predicateLength: data.predicate?.length,
    }) as unknown as InputMessage;
  }
}

export class InputParser implements EntityParser<Input, RawInput> {
  private coinParser = new InputCoinParser();
  private contractParser = new InputContractParser();
  private messageParser = new InputMessageParser();

  parse(data: RawInput): Input {
    const type = snakify(data.type);
    if (type === InputType.Coin) {
      return this.coinParser.parse(data as RawInputCoin);
    }
    if (type === InputType.Contract) {
      return this.contractParser.parse(data as RawInputContract);
    }
    if (type === InputType.Message) {
      return this.messageParser.parse(data as RawInputMessage);
    }

    throw new Error(`Unknown input type: ${type}`);
  }
}

export class OutputCoinParser {
  parse(data: RawCoinOutput): OutputCoin {
    const transformations = {
      type: () => OutputType.Coin,
      amount: safeToBN,
    };
    return evolve(transformations, data) as unknown as OutputCoin;
  }
}

export class OutputContractParser {
  parse(data: RawContractOutput): OutputContract {
    const transformations = {
      type: () => OutputType.Contract,
      inputIndex: Number,
    };
    return evolve(transformations, data) as unknown as OutputContract;
  }
}

export class OutputChangeParser {
  parse(data: RawChangeOutput): OutputChange {
    const transformations = {
      type: () => OutputType.Change,
      amount: safeToBN,
    };
    return evolve(transformations, data) as unknown as OutputChange;
  }
}

export class OutputVariableParser {
  parse(data: RawVariableOutput): OutputVariable {
    const transformations = {
      type: () => OutputType.Variable,
      amount: safeToBN,
    };
    return evolve(transformations, data) as unknown as OutputVariable;
  }
}

export class OutputContractCreatedParser {
  parse(data: RawContractCreated): OutputContractCreated {
    const transformations = {
      type: () => OutputType.ContractCreated,
    };
    return evolve(transformations, data) as unknown as OutputContractCreated;
  }
}

export class OutputParser implements EntityParser<Output, RawOutput> {
  private coinParser = new OutputCoinParser();
  private contractParser = new OutputContractParser();
  private changeParser = new OutputChangeParser();
  private variableParser = new OutputVariableParser();
  private contractCreatedParser = new OutputContractCreatedParser();

  parse(data: RawOutput): Output {
    const type = snakify(data.type);
    if (type === OutputType.Coin) {
      return this.coinParser.parse(data as RawCoinOutput);
    }
    if (type === OutputType.Contract) {
      return this.contractParser.parse(data as RawContractOutput);
    }
    if (type === OutputType.Change) {
      return this.changeParser.parse(data as RawChangeOutput);
    }
    if (type === OutputType.Variable) {
      return this.variableParser.parse(data as RawVariableOutput);
    }
    if (type === OutputType.ContractCreated) {
      return this.contractCreatedParser.parse(data as RawContractCreated);
    }

    throw new Error(`Unknown output type: ${type}`);
  }
}

export class PredicateParser implements EntityParser<Predicate, RawPredicate> {
  parse(data: RawPredicate): Predicate {
    const transformations = {
      txIndex: safeToBN(data.txIndex),
      inputIndex: safeToBN(data.inputIndex),
    };
    return { ...data, ...transformations } as Predicate;
  }
}

export class ReceiptParser implements EntityParser<Receipt, RawReceipt> {
  parse(item: RawReceipt, abi?: JsonAbi): Receipt {
    const type = snakify(item.type);

    if (type === ReceiptType.Call) {
      return evolve(
        {
          amount: safeToBN,
          gas: safeToBN,
          param1: safeToBN,
          param2: safeToBN,
          pc: safeToBN,
          is: safeToBN,
        },
        item as unknown as RawCallReceipt,
      ) as unknown as Receipt;
    }
    if (type === ReceiptType.Return || type === ReceiptType.Revert) {
      return evolve(
        {
          val: safeToBN,
          pc: safeToBN,
          is: safeToBN,
        },
        item as unknown as RawReturnReceipt,
      ) as unknown as Receipt;
    }
    if (type === ReceiptType.ReturnData) {
      return evolve(
        {
          ptr: safeToBN,
          len: safeToBN,
          pc: safeToBN,
          is: safeToBN,
        },
        item as unknown as RawReturnDataReceipt,
      ) as unknown as Receipt;
    }
    if (type === ReceiptType.LogData) {
      const contract = abi && new Interface(abi);
      const receipt = item as unknown as RawLogDataReceipt;
      const data = receipt.data
        ? contract?.decodeLog(receipt.data, receipt.rb)
        : receipt.data;
      return evolve(
        {
          ptr: safeToBN,
          len: safeToBN,
          pc: safeToBN,
          is: safeToBN,
          data: () => data,
        },
        item as unknown as RawLogDataReceipt,
      ) as unknown as Receipt;
    }
    if (type === ReceiptType.Panic) {
      return evolve(
        {
          pc: safeToBN,
          is: safeToBN,
        },
        item as unknown as RawPanicReceipt,
      ) as unknown as Receipt;
    }
    if (type === ReceiptType.Log) {
      return evolve(
        {
          ra: safeToBN,
          rb: safeToBN,
          rc: safeToBN,
          rd: safeToBN,
          pc: safeToBN,
          is: safeToBN,
        },
        item as unknown as RawLogReceipt,
      ) as unknown as Receipt;
    }
    if (type === ReceiptType.Transfer || type === ReceiptType.TransferOut) {
      return evolve(
        {
          amount: safeToBN,
          pc: safeToBN,
          is: safeToBN,
        },
        item as unknown as RawTransferReceipt,
      ) as unknown as Receipt;
    }
    if (type === ReceiptType.ScriptResult) {
      return evolve(
        {
          gasUsed: safeToBN,
        },
        item as unknown as RawScriptResultReceipt,
      ) as unknown as Receipt;
    }
    if (type === ReceiptType.MessageOut) {
      return evolve(
        {
          amount: safeToBN,
          len: safeToBN,
        },
        item as unknown as RawMessageOutReceipt,
      ) as unknown as Receipt;
    }
    if (type === ReceiptType.Mint || type === ReceiptType.Burn) {
      return evolve(
        {
          val: safeToBN,
          pc: safeToBN,
          is: safeToBN,
        },
        item as unknown as RawMintReceipt,
      ) as unknown as Receipt;
    }
    throw new Error(`Unknown receipt type: ${type}`);
  }
}

const TRANSACTION_TYPE_MAP = {
  create: 0,
  mint: 1,
  script: 2,
  upgrade: 3,
  upload: 4,
  blob: 5,
} as const;

export class TransactionParser
  implements EntityParser<Transaction, RawTransaction>
{
  private inputParser = new InputParser();
  private outputParser = new OutputParser();
  private receiptParser = new ReceiptParser();

  private toWitnesses(v: string[] | undefined) {
    return v?.map((data) => ({ dataLength: data.length, data })) ?? [];
  }

  private parseInputs(inputs: RawInput[] | undefined) {
    return inputs?.map((input) => this.inputParser.parse(input)) ?? [];
  }

  private parseOutputs(outputs: RawOutput[] | undefined) {
    return outputs?.map((output) => this.outputParser.parse(output)) ?? [];
  }

  private parseReceipts(
    _tx: RawTransaction,
    receipts: RawReceipt[] | undefined,
    abi?: JsonAbi,
  ): Receipt[] {
    return (
      receipts?.map((receipt) => this.receiptParser.parse(receipt, abi)) ?? []
    );
  }

  parse(data: RawTransaction, abi?: JsonAbi): Transaction {
    const transformations = {
      type: () => TRANSACTION_TYPE_MAP[data.type],
      witnesses: this.toWitnesses,
      inputs: this.parseInputs.bind(this),
      outputs: this.parseOutputs.bind(this),
      receipts: this.parseReceipts.bind(this, data, data.receipts, abi),
      maturity: safeToBN,
      mintAmount: safeToBN,
      mintGasPrice: safeToBN,
      scriptGasLimit: safeToBN,
      upgradePurpose: safeToBN,
      policies: (policies: Policies) => ({
        maxFee: safeToBN(policies?.maxFee),
        witnessLimit: safeToBN(policies?.witnessLimit),
        maturity: safeToBN(policies?.maturity),
        maxSize: safeToBN(policies?.maxSize),
      }),
      txPointer: (txPointer: TxPointer) =>
        txPointer
          ? {
              ...txPointer,
              blockHeight: safeToBN(txPointer?.blockHeight),
            }
          : {},
      txIndex: safeToBN(data.txIndex),
    };

    try {
      return evolve(transformations, data) as unknown as Transaction;
    } catch (error) {
      console.error('Transaction parsing failed:', error, data);
      throw error;
    }
  }
}

export class UtxoParser implements EntityParser<Utxo, RawUtxo> {
  parse(data: RawUtxo): Utxo {
    const transformations = {
      amount: safeToBN,
    };
    return evolve(transformations, data) as Utxo;
  }
}

export function findParser<T extends EntityParser<any, any>>(id: string): T {
  if (id.startsWith('blocks')) return new BlockParser() as unknown as T;
  if (id.startsWith('transactions'))
    return new TransactionParser() as unknown as T;
  if (id.startsWith('inputs')) return new InputParser() as unknown as T;
  if (id.startsWith('outputs')) return new OutputParser() as unknown as T;
  if (id.startsWith('predicates')) return new PredicateParser() as unknown as T;
  if (id.startsWith('receipts')) return new ReceiptParser() as unknown as T;
  if (id.startsWith('utxos')) return new UtxoParser() as unknown as T;

  throw new Error(`Parser not found for id: ${id}`);
}
