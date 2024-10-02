import type { BytesLike, Block as FuelBlock } from 'fuels';

type BlockHeight = number;
type Bytes32 = BytesLike;

export class LogsSubject {
  blockHeight?: BlockHeight;
  txId?: Bytes32;
  receiptIndex?: number;
  logId?: Bytes32;

  static readonly WILDCARD = 'logs.>';

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
  ): string {
    return new LogsSubject(
      blockHeight,
      txId,
      receiptIndex,
      logId,
    ).parseWildcard();
  }

  parse(): string {
    const parts = [
      'logs',
      this.blockHeight?.toString() || '*',
      this.txId || '*',
      this.receiptIndex?.toString() || '*',
      this.logId || '*',
    ];
    return parts.join('.');
  }

  parseWildcard(): string {
    const parts = [
      'logs',
      this.blockHeight?.toString() || '*',
      this.txId || '*',
      this.receiptIndex?.toString() || '*',
      this.logId || '*',
    ];
    return parts.join('.');
  }

  withBlockHeight(blockHeight?: BlockHeight): this {
    this.blockHeight = blockHeight;
    return this;
  }

  withTxId(txId?: Bytes32): this {
    this.txId = txId;
    return this;
  }

  withReceiptIndex(receiptIndex?: number): this {
    this.receiptIndex = receiptIndex;
    return this;
  }

  withLogId(logId?: Bytes32): this {
    this.logId = logId;
    return this;
  }
}
