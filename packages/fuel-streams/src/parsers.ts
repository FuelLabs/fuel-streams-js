import { bn as toBN } from 'fuels';
import { evolve } from 'ramda';
import type { StreamParser } from './stream';
import {
  type Block,
  type Input,
  type InputCoin,
  type InputContract,
  type InputMessage,
  InputType,
  type Log,
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
  type RawLog,
  type RawLogWithData,
  type RawLogWithoutData,
  type RawOutput,
  type RawReceipt,
  type RawTransaction,
  type RawUtxo,
  type RawVariableOutput,
  type Receipt,
  // ReceiptType,
  type Transaction,
  type Utxo,
} from './types';

export class BlockParser implements StreamParser<Block, RawBlock> {
  parse(data: RawBlock): Block {
    const transformations = {
      height: toBN,
      header: {
        daHeight: toBN,
        height: toBN,
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
      amount: toBN,
      predicateGasUsed: toBN,
    };

    return evolve(transformations, {
      ...rest,
      txID: utxoId.txId,
      outputIndex: utxoId.outputIndex,
      predicateDataLength: toBN(rest.predicateData?.length),
      predicateLength: toBN(rest.predicate?.length),
    }) as InputCoin;
  }
}

export class InputContractParser {
  parse(data: RawInputContract): InputContract {
    const { utxoId, ...rest } = data;
    const transformations = { type: () => InputType.Contract };
    return evolve(transformations, {
      ...rest,
      txID: utxoId.txId,
      outputIndex: utxoId.outputIndex,
      contractID: rest.contractId,
    }) as InputContract;
  }
}

export class InputMessageParser {
  parse(data: RawInputMessage): InputMessage {
    const transformations = {
      type: () => InputType.Message,
      amount: toBN,
      predicateGasUsed: toBN,
    };

    return evolve(transformations, {
      ...data,
      predicateDataLength: toBN(data.predicateData.length),
      predicateLength: toBN(data.predicate.length),
    }) as InputMessage;
  }
}

export class InputParser implements StreamParser<Input, RawInput> {
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
  }
}

export class OutputCoinParser {
  parse(data: RawCoinOutput): OutputCoin {
    const transformations = { type: () => OutputType.Coin, amount: toBN };
    return evolve(transformations, data) as OutputCoin;
  }
}

export class OutputContractParser {
  parse(data: RawContractOutput): OutputContract {
    const transformations = { type: () => OutputType.Contract };
    return evolve(transformations, data) as OutputContract;
  }
}

export class OutputChangeParser {
  parse(data: RawChangeOutput): OutputChange {
    const transformations = { type: () => OutputType.Change, amount: toBN };
    return evolve(transformations, data) as OutputChange;
  }
}

export class OutputVariableParser {
  parse(data: RawVariableOutput): OutputVariable {
    const transformations = { type: () => OutputType.Variable, amount: toBN };
    return evolve(transformations, data) as OutputVariable;
  }
}

export class OutputContractCreatedParser {
  parse(data: RawContractCreated): OutputContractCreated {
    const transformations = { type: () => OutputType.ContractCreated };
    return evolve(transformations, data) as OutputContractCreated;
  }
}

export class OutputParser implements StreamParser<Output, RawOutput> {
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
  }
}

export class LogWithoutDataParser {
  parse(data: RawLogWithoutData): Log {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return data as any;
    // const transformations = {
    //   type: () => ReceiptType.Log,
    //   ra: toBN,
    //   rb: toBN,
    //   rc: toBN,
    //   rd: toBN,
    //   pc: toBN,
    //   is: toBN,
    // };

    // return evolve(transformations, {
    //   ...data,
    //   val0: toBN(data.ra),
    //   val1: toBN(data.rb),
    //   val2: toBN(data.rc),
    //   val3: toBN(data.rd),
    // }) as Log;
  }
}

export class LogWithDataParser {
  parse(data: RawLogWithData): Log {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return data as any;
    // const transformations = {
    //   type: () => ReceiptType.LogData,
    //   ra: toBN,
    //   rb: toBN,
    //   ptr: toBN,
    //   len: toBN,
    //   pc: toBN,
    //   is: toBN,
    // };

    // return evolve(transformations, {
    //   ...data,
    //   val0: toBN(data.ra),
    //   val1: toBN(data.rb),
    // }) as Log;
  }
}

export class LogParser implements StreamParser<Log, RawLog> {
  private withoutDataParser = new LogWithoutDataParser();
  private withDataParser = new LogWithDataParser();

  parse(data: RawLog): Log {
    switch (data.type) {
      case 'WithoutData':
        return this.withoutDataParser.parse(data);
      case 'WithData':
        return this.withDataParser.parse(data);
    }
  }
}

export class ReceiptParser implements StreamParser<Receipt, RawReceipt> {
  parse(data: RawReceipt): Receipt {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return data as any;
    // const transformations = {
    //   type: (v: RawReceipt['type']) => ReceiptType[v],
    //   amount: toBN,
    //   gas: toBN,
    //   gasUsed: toBN,
    //   is: toBN,
    //   len: toBN,
    //   param1: toBN,
    //   param2: toBN,
    //   pc: toBN,
    //   ptr: toBN,
    //   ra: toBN,
    //   rb: toBN,
    //   rc: toBN,
    //   rd: toBN,
    //   reason: toBN,
    //   result: toBN,
    //   val: toBN,
    // };

    // return evolve({}, data) as Receipt;
  }
}

export class TransactionParser
  implements StreamParser<Transaction, RawTransaction>
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

  private parseReceipts(receipts: RawReceipt[]) {
    return receipts.map((receipt) => this.receiptParser.parse(receipt));
  }

  parse(data: RawTransaction): Transaction {
    const transformations = {
      mintAmount: toBN,
      mintGasPrice: toBN,
      scriptGasLimit: toBN,
      amount: toBN,
      gas: toBN,
      gasUsed: toBN,
      policies: {
        maxFee: toBN,
        witnessLimit: toBN,
        maturity: toBN,
        maxSize: toBN,
      },
      witnesses: this.toWitnesses,
      inputs: this.parseInputs.bind(this),
      outputs: this.parseOutputs.bind(this),
      receipts: this.parseReceipts.bind(this),
    };

    return evolve(transformations, data) as Transaction;
  }
}

export class UtxoParser implements StreamParser<Utxo, RawUtxo> {
  parse(data: RawUtxo): Utxo {
    const transformations = { amount: toBN };
    return evolve(transformations, data) as Utxo;
  }
}
