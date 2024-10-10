import type { BytesLike } from 'fuels';

type BlockHeight = number;
type Bytes32 = BytesLike;

export enum LogsWildcard {
  All = 'logs.>',
}

export class LogsSubject {
  blockHeight?: BlockHeight;
  txId?: Bytes32;
  receiptIndex?: number;
  logId?: Bytes32;

  constructor(
    blockHeight?: BlockHeight,
    txId?: Bytes32,
    receiptIndex?: number,
    logId?: Bytes32,
  ) {
    this.blockHeight = blockHeight;
    this.txId = txId;
    this.receiptIndex = receiptIndex;
    this.logId = logId;
  }

  static wildcard(
    blockHeight?: BlockHeight,
    txId?: Bytes32,
    receiptIndex?: number,
    logId?: Bytes32,
  ) {
    return new LogsSubject(
      blockHeight,
      txId,
      receiptIndex,
      logId,
    ).parseWildcard();
  }

  parse() {
    return `logs.${this.blockHeight || '*'}.${this.txId || '*'}.${
      this.receiptIndex || '*'
    }.${this.logId || '*'}` as const;
  }

  parseWildcard() {
    return `logs.${this.blockHeight || '*'}.${this.txId || '*'}.${
      this.receiptIndex || '*'
    }.${this.logId || '*'}` as const;
  }

  withBlockHeight(blockHeight?: BlockHeight) {
    this.blockHeight = blockHeight;
    return this;
  }

  withTxId(txId?: Bytes32) {
    this.txId = txId;
    return this;
  }

  withReceiptIndex(receiptIndex?: number) {
    this.receiptIndex = receiptIndex;
    return this;
  }

  withLogId(logId?: Bytes32) {
    this.logId = logId;
    return this;
  }
}
