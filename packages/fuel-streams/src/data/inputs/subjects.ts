import type {
  Address,
  AssetId,
  Bytes32,
  ContractId,
  IdentifierKind,
  Subject,
} from '..';

export enum InputsWildcard {
  All = 'inputs.>',
  ById = 'by_id.inputs.>',
}

export class InputsCoinSubject implements Subject {
  constructor(
    public tx_id: Bytes32 | null = null,
    public index: number | null = null,
    public owner: Address | null = null,
    public asset_id: AssetId | null = null,
  ) {}

  parse() {
    return `inputs.${this.tx_id || '*'}.${this.index || '*'}.coin.${
      this.owner || '*'
    }.${this.asset_id || '*'}` as const;
  }

  static wildcard(
    tx_id: Bytes32 | null,
    index: number | null,
    owner: Address | null,
    asset_id: AssetId | null,
  ) {
    return new InputsCoinSubject(tx_id, index, owner, asset_id).parse();
  }

  static new() {
    return new InputsCoinSubject();
  }

  with_tx_id(tx_id: Bytes32 | null) {
    this.tx_id = tx_id;
    return this;
  }

  with_index(index: number | null) {
    this.index = index;
    return this;
  }

  with_owner(owner: Address | null) {
    this.owner = owner;
    return this;
  }

  with_asset_id(asset_id: AssetId | null) {
    this.asset_id = asset_id;
    return this;
  }
}

// =============================================

export class InputsContractSubject implements Subject {
  constructor(
    public tx_id: Bytes32 | null = null,
    public index: number | null = null,
    public contract_id: ContractId | null = null,
  ) {}

  parse() {
    return `inputs.${this.tx_id || '*'}.${this.index || '*'}.contract.${
      this.contract_id || '*'
    }` as const;
  }

  static wildcard(
    tx_id: Bytes32 | null,
    index: number | null,
    contract_id: ContractId | null,
  ) {
    return new InputsContractSubject(tx_id, index, contract_id).parse();
  }

  static new() {
    return new InputsContractSubject();
  }

  with_tx_id(tx_id: Bytes32 | null) {
    this.tx_id = tx_id;
    return this;
  }

  with_index(index: number | null) {
    this.index = index;
    return this;
  }

  with_contract_id(contract_id: ContractId | null) {
    this.contract_id = contract_id;
    return this;
  }
}

// =============================================

export class InputsMessageSubject implements Subject {
  constructor(
    public tx_id: Bytes32 | null = null,
    public index: number | null = null,
    public sender: Address | null = null,
    public recipient: Address | null = null,
  ) {}

  parse() {
    return `inputs.${this.tx_id || '*'}.${this.index || '*'}.message.${
      this.sender || '*'
    }.${this.recipient || '*'}` as const;
  }

  static wildcard(
    tx_id: Bytes32 | null,
    index: number | null,
    sender: Address | null,
    recipient: Address | null,
  ) {
    return new InputsMessageSubject(tx_id, index, sender, recipient).parse();
  }

  static new() {
    return new InputsMessageSubject();
  }

  with_tx_id(tx_id: Bytes32 | null) {
    this.tx_id = tx_id;
    return this;
  }

  with_index(index: number | null) {
    this.index = index;
    return this;
  }

  with_sender(sender: Address | null) {
    this.sender = sender;
    return this;
  }

  with_recipient(recipient: Address | null) {
    this.recipient = recipient;
    return this;
  }
}

// =============================================

export class InputsByIdSubject implements Subject {
  constructor(
    public id_kind: IdentifierKind | null = null,
    public id_value: Bytes32 | null = null,
  ) {}

  parse() {
    return `by_id.inputs.${this.id_kind || '*'}.${
      this.id_value || '*'
    }` as const;
  }

  static wildcard(id_kind: IdentifierKind | null, id_value: Bytes32 | null) {
    return new InputsByIdSubject(id_kind, id_value).parse();
  }

  static new() {
    return new InputsByIdSubject();
  }

  with_id_kind(id_kind: IdentifierKind | null) {
    this.id_kind = id_kind;
    return this;
  }

  with_id_value(id_value: Bytes32 | null) {
    this.id_value = id_value;
    return this;
  }
}
