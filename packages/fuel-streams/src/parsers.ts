import { bn, hexlify } from 'fuels';
import { InputType, OutputType, ReceiptType, TransactionType } from 'fuels';
import { evolve } from 'ramda';
import { TAI64 } from 'tai64';
import type { StreamParser } from './stream';
import type {
  Block,
  Input,
  InputCoin,
  InputContract,
  InputMessage,
  Log,
  Output,
  OutputChange,
  OutputCoin,
  OutputContract,
  OutputContractCreated,
  OutputVariable,
  RawBlock,
  RawChangeOutput,
  RawCoinOutput,
  RawContractCreated,
  RawContractOutput,
  RawInput,
  RawInputCoin,
  RawInputContract,
  RawInputMessage,
  RawLog,
  RawLogWithData,
  RawLogWithoutData,
  RawOutput,
  RawReceipt,
  RawTransaction,
  RawUtxo,
  RawVariableOutput,
  Receipt,
  Transaction,
  Utxo,
} from './types';

const to = {
  bn: (v?: number) => (v ? bn(v) : null),
  hex: (v?: number[]) =>
    v?.length ? `0x${hexlify(Uint8Array.from(v))}` : null,
  tai64: (v?: number[]) =>
    v?.length ? TAI64.fromByteArray(v).toString() : null,
} as const;

const TRANSACTION_KIND_MAP = {
  create: TransactionType.Create,
  mint: TransactionType.Mint,
  script: TransactionType.Script,
  upgrade: TransactionType.Upgrade,
  upload: TransactionType.Upload,
  blob: TransactionType.Blob,
} as const;

export class BlockParser implements StreamParser<Block> {
  parse(data: RawBlock): Block {
    const { transactions, ...rest } = data;
    const transformations = {
      height: to.bn,
      time: to.tai64,
      header: {
        daHeight: to.bn,
        stateTransitionBytecodeVersion: String,
        transactionsCount: String,
      },
    };
    return evolve(transformations, {
      ...rest,
      transactionIds: transactions,
    }) as Block;
  }
}

export class InputCoinParser {
  parse(data: RawInputCoin): InputCoin {
    const { utxoId, ...rest } = data;
    const transformations = {
      type: () => InputType.Coin,
      amount: to.bn,
      predicateGasUsed: to.bn,
      predicate: to.hex,
      predicateData: to.hex,
    };

    return evolve(transformations, {
      ...rest,
      txID: utxoId.txId,
      outputIndex: utxoId.outputIndex,
      predicateDataLength: to.bn(rest.predicateData?.length),
      predicateLength: to.bn(rest.predicate?.length),
    }) as InputCoin;
  }
}

export class InputContractParser {
  parse(data: RawInputContract): InputContract {
    const { utxoId, ...rest } = data;
    const transformations = {
      type: () => InputType.Contract,
      balanceRoot: to.hex,
      stateRoot: to.hex,
    };

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
      amount: to.bn,
      predicateGasUsed: to.bn,
      predicate: to.hex,
      predicateData: to.hex,
      data: to.hex,
    };

    return evolve(transformations, {
      ...data,
      predicateDataLength: to.bn(data.predicateData.length),
      predicateLength: to.bn(data.predicate.length),
    }) as InputMessage;
  }
}

export class InputParser implements StreamParser<Input> {
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
    const transformations = {
      type: () => OutputType.Coin,
      amount: bn,
    };
    return evolve(transformations, data) as OutputCoin;
  }
}

export class OutputContractParser {
  parse(data: RawContractOutput): OutputContract {
    const transformations = {
      type: () => OutputType.Contract,
      balanceRoot: to.hex,
      stateRoot: to.hex,
    };
    return evolve(transformations, data) as OutputContract;
  }
}

export class OutputChangeParser {
  parse(data: RawChangeOutput): OutputChange {
    const transformations = {
      type: () => OutputType.Change,
      amount: to.bn,
    };
    return evolve(transformations, data) as OutputChange;
  }
}

export class OutputVariableParser {
  parse(data: RawVariableOutput): OutputVariable {
    const transformations = {
      type: () => OutputType.Variable,
      amount: to.bn,
    };
    return evolve(transformations, data) as OutputVariable;
  }
}

export class OutputContractCreatedParser {
  parse(data: RawContractCreated): OutputContractCreated {
    const transformations = {
      type: () => OutputType.ContractCreated,
      stateRoot: to.hex,
    };
    return evolve(transformations, data) as OutputContractCreated;
  }
}

export class OutputParser implements StreamParser<Output> {
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
    const transformations = {
      type: () => ReceiptType.Log,
      ra: to.bn,
      rb: to.bn,
      rc: to.bn,
      rd: to.bn,
      pc: to.bn,
      is: to.bn,
    };

    return evolve(transformations, {
      ...data,
      val0: to.bn(data.ra),
      val1: to.bn(data.rb),
      val2: to.bn(data.rc),
      val3: to.bn(data.rd),
    }) as Log;
  }
}

export class LogWithDataParser {
  parse(data: RawLogWithData): Log {
    const transformations = {
      type: () => ReceiptType.LogData,
      ra: to.bn,
      rb: to.bn,
      ptr: to.bn,
      len: to.bn,
      pc: to.bn,
      is: to.bn,
      digest: to.hex,
      data: to.hex,
    };

    return evolve(transformations, {
      ...data,
      val0: to.bn(data.ra),
      val1: to.bn(data.rb),
    }) as Log;
  }
}

export class LogParser implements StreamParser<Log> {
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

export class ReceiptParser implements StreamParser<Receipt> {
  parse(data: RawReceipt): Receipt {
    const transformations = {
      type: (v: RawReceipt['type']) => ReceiptType[v],
      amount: to.bn,
      gas: to.bn,
      gasUsed: to.bn,
      is: to.bn,
      len: to.bn,
      param1: to.bn,
      param2: to.bn,
      pc: to.bn,
      ptr: to.bn,
      ra: to.bn,
      rb: to.bn,
      rc: to.bn,
      rd: to.bn,
      reason: to.bn,
      result: to.bn,
      val: to.bn,
      data: to.hex,
      digest: to.hex,
      subId: to.hex,
    };

    return evolve(transformations, data) as Receipt;
  }
}

export class TransactionParser implements StreamParser<Transaction> {
  private inputParser = new InputParser();
  private outputParser = new OutputParser();
  private receiptParser = new ReceiptParser();

  private toStorageSlots(v: number[][]) {
    return v.map(([key, value]: number[]) => ({
      key: to.hex([key]),
      value: to.hex([value]),
    }));
  }

  private toWitnesses(v: number[][]) {
    return v.map((w: number[]) => ({ dataLength: w.length, data: to.hex(w) }));
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
      mintAmount: to.bn,
      mintGasPrice: to.bn,
      scriptGasLimit: to.bn,
      amount: to.bn,
      gas: to.bn,
      gasUsed: to.bn,
      policies: {
        maxFee: to.bn,
        witnessLimit: to.bn,
        maturity: to.bn,
        maxSize: to.bn,
      },
      rawPayload: to.hex,
      script: to.hex,
      scriptData: to.hex,
      storageSlots: this.toStorageSlots,
      witnesses: this.toWitnesses,
      inputs: this.parseInputs.bind(this),
      outputs: this.parseOutputs.bind(this),
      receipts: this.parseReceipts.bind(this),
    };

    return evolve(transformations, {
      ...data,
      type: TRANSACTION_KIND_MAP[data.kind],
    }) as Transaction;
  }
}

export class UtxoParser implements StreamParser<Utxo> {
  parse(data: RawUtxo): Utxo {
    const transformations = {
      amount: to.bn,
      data: to.hex,
    };
    return evolve(transformations, data) as Utxo;
  }
}
