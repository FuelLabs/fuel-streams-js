import { Interface, type JsonAbi, bn as toBN } from 'fuels';
import { evolve } from 'ramda';
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
  type RawBlock,
  type RawChangeOutput,
  type RawCoinOutput,
  type RawContractCreated,
  type RawContractOutput,
  type RawInput,
  type RawInputCoin,
  type RawInputContract,
  type RawInputMessage,
  type RawOutput,
  type RawReceipt,
  type RawTransaction,
  type RawUtxo,
  type RawVariableOutput,
  type Receipt,
  ReceiptType,
  type Transaction,
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
        stateTransitionBytecodeVersion: String,
        transactionsCount: String,
        messageReceiptCount: String,
        consensusParametersVersion: String,
      },
    };
    return evolve(transformations, data) as Block;
  }
}

export class InputCoinParser {
  parse(data: RawInputCoin): InputCoin {
    const { utxoId, ...rest } = data;
    const transformations = {
      type: () => InputType.Coin,
      amount: safeToBN,
      predicateGasUsed: safeToBN,
      predicateDataLength: safeToBN,
      predicateLength: safeToBN,
    };

    return evolve(transformations, {
      ...rest,
      txID: utxoId.txId,
      outputIndex: utxoId.outputIndex,
      predicateDataLength: safeToBN(rest.predicateData?.length),
      predicateLength: safeToBN(rest.predicate?.length),
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
      predicateDataLength: safeToBN,
      predicateLength: safeToBN,
    };

    return evolve(transformations, {
      ...data,
    }) as unknown as InputMessage;
  }
}

export class InputParser implements EntityParser<Input, RawInput> {
  private coinParser = new InputCoinParser();
  private contractParser = new InputContractParser();
  private messageParser = new InputMessageParser();

  parse(data: RawInput): Input {
    switch (data.type) {
      case 'Coin':
        return this.coinParser.parse(data);
      case 'Contract':
        return this.contractParser.parse(data);
      case 'Message':
        return this.messageParser.parse(data);
    }
    throw new Error('Invalid input type');
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
    switch (data.type) {
      case 'Coin':
        return this.coinParser.parse(data);
      case 'Contract':
        return this.contractParser.parse(data);
      case 'Change':
        return this.changeParser.parse(data);
      case 'Variable':
        return this.variableParser.parse(data);
      case 'ContractCreated':
        return this.contractCreatedParser.parse(data);
    }
    throw new Error('Invalid output type');
  }
}

export class ReceiptParser implements EntityParser<Receipt, RawReceipt> {
  parse(item: RawReceipt, abi?: JsonAbi): Receipt {
    if (item.type === ReceiptType.Call) {
      return evolve(
        {
          amount: safeToBN,
          gas: safeToBN,
          param1: safeToBN,
          param2: safeToBN,
          pc: safeToBN,
          is: safeToBN,
        },
        item,
      ) as unknown as Receipt;
    }

    if (item.type === ReceiptType.Return || item.type === ReceiptType.Revert) {
      return evolve(
        {
          val: safeToBN,
          pc: safeToBN,
          is: safeToBN,
        },
        item,
      ) as unknown as Receipt;
    }

    if (item.type === ReceiptType.ReturnData) {
      return evolve(
        {
          ptr: safeToBN,
          len: safeToBN,
          pc: safeToBN,
          is: safeToBN,
        },
        item,
      ) as unknown as Receipt;
    }

    if (item.type === ReceiptType.LogData) {
      const contract = abi && new Interface(abi);
      const data = item.data
        ? contract?.decodeLog(item.data, item.rb)
        : item.data;
      return evolve(
        {
          ptr: safeToBN,
          len: safeToBN,
          pc: safeToBN,
          is: safeToBN,
          data: () => data,
        },
        item,
      ) as unknown as Receipt;
    }

    if (item.type === ReceiptType.Panic) {
      return evolve(
        {
          pc: safeToBN,
          is: safeToBN,
        },
        item,
      ) as unknown as Receipt;
    }

    if (item.type === ReceiptType.Log) {
      return evolve(
        {
          ra: safeToBN,
          rb: safeToBN,
          rc: safeToBN,
          rd: safeToBN,
          pc: safeToBN,
          is: safeToBN,
        },
        item,
      ) as unknown as Receipt;
    }

    if (
      item.type === ReceiptType.Transfer ||
      item.type === ReceiptType.TransferOut
    ) {
      return evolve(
        {
          amount: safeToBN,
          pc: safeToBN,
          is: safeToBN,
        },
        item,
      ) as unknown as Receipt;
    }

    if (item.type === ReceiptType.ScriptResult) {
      return evolve(
        {
          gasUsed: safeToBN,
        },
        item,
      ) as unknown as Receipt;
    }

    if (item.type === ReceiptType.MessageOut) {
      return evolve(
        {
          amount: safeToBN,
          len: safeToBN,
        },
        item,
      ) as unknown as Receipt;
    }

    if (item.type === ReceiptType.Mint || item.type === ReceiptType.Burn) {
      return evolve(
        {
          val: safeToBN,
          pc: safeToBN,
          is: safeToBN,
        },
        item,
      ) as unknown as Receipt;
    }

    throw new Error(`Unknown receipt type: ${(item as any).type}`);
  }
}

const TRANSACTION_TYPE_MAP = {
  create: 0,
  mint: 1,
  script: 2,
  upgrade: 3,
  upload: 4,
  blob: 5,
};

export class TransactionParser
  implements EntityParser<Transaction, RawTransaction>
{
  private inputParser = new InputParser();
  private outputParser = new OutputParser();
  private receiptParser = new ReceiptParser();

  private toWitnesses(v: string[]) {
    return v.map((data) => ({ dataLength: data.length, data }));
  }

  private parseInputs(inputs: RawInput[]) {
    return inputs.map((input) => this.inputParser.parse(input));
  }

  private parseOutputs(outputs: RawOutput[]) {
    return outputs.map((output) => this.outputParser.parse(output));
  }

  private parseReceipts(
    _tx: RawTransaction,
    receipts: RawReceipt[],
    abi?: JsonAbi,
  ): Receipt[] {
    return receipts.map((receipt) => this.receiptParser.parse(receipt, abi));
  }

  parse(data: RawTransaction, abi?: JsonAbi): Transaction {
    const transformations = {
      type: () => TRANSACTION_TYPE_MAP[data.type],
      witnesses: this.toWitnesses,
      inputs: this.parseInputs.bind(this),
      outputs: this.parseOutputs.bind(this),
      receipts: this.parseReceipts.bind(this, data, data.receipts, abi),
      bytecodeWitnessIndex: safeToBN,
      maturity: safeToBN,
      mintAmount: safeToBN,
      mintGasPrice: safeToBN,
      scriptGasLimit: safeToBN,
      subsectionIndex: safeToBN,
      subsectionsNumber: safeToBN,
      upgradePurpose: safeToBN,
    };

    try {
      const result = evolve(transformations, data) as Transaction;
      console.log('Successfully parsed transaction');
      return result;
    } catch (error) {
      console.error('Transaction parsing failed:', error);
      throw error;
    }
  }
}

export class UtxoParser implements EntityParser<Utxo, RawUtxo> {
  parse(data: RawUtxo): Utxo {
    const transformations = { amount: safeToBN };
    return evolve(transformations, data) as Utxo;
  }
}
