export enum DeliverPolicyType {
  FromBlock = 'from_block',
  New = 'new',
}

export type DeliverPolicyConfig =
  | { type: DeliverPolicyType.New }
  | { type: DeliverPolicyType.FromBlock; blockNumber: number };

export class DeliverPolicy {
  private config: DeliverPolicyConfig;

  constructor(config: DeliverPolicyConfig) {
    this.config = config;
  }

  static new(): DeliverPolicy {
    return new DeliverPolicy({ type: DeliverPolicyType.New });
  }

  static fromBlock(blockNumber: number): DeliverPolicy {
    return new DeliverPolicy({
      type: DeliverPolicyType.FromBlock,
      blockNumber,
    });
  }

  static parse(value: string): DeliverPolicy {
    if (value === 'new') {
      return DeliverPolicy.new();
    }
    const match = value.match(/^from_block:(\d+)$/);
    if (match) {
      return DeliverPolicy.fromBlock(Number.parseInt(match[1], 10));
    }
    throw new Error(`Invalid deliver policy format: ${value}`);
  }

  toString(): string {
    switch (this.config.type) {
      case DeliverPolicyType.New:
        return 'new';
      case DeliverPolicyType.FromBlock:
        return `from_block:${this.config.blockNumber}`;
    }
  }

  getConfig(): DeliverPolicyConfig {
    return this.config;
  }

  isNew(): boolean {
    return this.config.type === DeliverPolicyType.New;
  }

  isFromBlock(): boolean {
    return this.config.type === DeliverPolicyType.FromBlock;
  }

  getBlockNumber(): number | null {
    return this.isFromBlock()
      ? (
          this.config as {
            type: DeliverPolicyType.FromBlock;
            blockNumber: number;
          }
        ).blockNumber
      : null;
  }

  stringStatic(): string {
    switch (this.config.type) {
      case DeliverPolicyType.New:
        return 'DeliverPolicy.new()';
      case DeliverPolicyType.FromBlock:
        return `DeliverPolicy.fromBlock(${this.config.blockNumber})`;
    }
  }
}
