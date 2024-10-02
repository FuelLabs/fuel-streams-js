import type {
  AddressLike,
  BytesLike,
  ContractIdLike,
  AssetId as FuelAssetId,
  Input as FuelInput,
  InputType as FuelInputType,
} from 'fuels';

export interface Subject {
  parse(): string;
}

type Bytes32 = BytesLike;
type Address = AddressLike;
type AssetId = FuelAssetId;
type ContractId = ContractIdLike;

export class InputsCoinSubject implements Subject {
  static WILDCARD = 'inputs.>';

  constructor(
    public tx_id: Bytes32 | null = null,
    public index: number | null = null,
    public owner: Address | null = null,
    public asset_id: AssetId | null = null,
  ) {}

  parse(): string {
    return `inputs.${this.tx_id || '*'}.${this.index || '*'}.coin.${
      this.owner || '*'
    }.${this.asset_id || '*'}`;
  }

  static wildcard(
    tx_id: Bytes32 | null,
    index: number | null,
    owner: Address | null,
    asset_id: AssetId | null,
  ): string {
    return new InputsCoinSubject(tx_id, index, owner, asset_id).parse();
  }

  static new(): InputsCoinSubject {
    return new InputsCoinSubject();
  }

  with_tx_id(tx_id: Bytes32 | null): this {
    this.tx_id = tx_id;
    return this;
  }

  with_index(index: number | null): this {
    this.index = index;
    return this;
  }

  with_owner(owner: Address | null): this {
    this.owner = owner;
    return this;
  }

  with_asset_id(asset_id: AssetId | null): this {
    this.asset_id = asset_id;
    return this;
  }
}

// =============================================

export class InputsContractSubject implements Subject {
  static WILDCARD = 'inputs.>';

  constructor(
    public tx_id: Bytes32 | null = null,
    public index: number | null = null,
    public contract_id: ContractId | null = null,
  ) {}

  parse(): string {
    return `inputs.${this.tx_id || '*'}.${this.index || '*'}.contract.${
      this.contract_id || '*'
    }`;
  }

  static wildcard(
    tx_id: Bytes32 | null,
    index: number | null,
    contract_id: ContractId | null,
  ): string {
    return new InputsContractSubject(tx_id, index, contract_id).parse();
  }

  static new(): InputsContractSubject {
    return new InputsContractSubject();
  }

  with_tx_id(tx_id: Bytes32 | null): this {
    this.tx_id = tx_id;
    return this;
  }

  with_index(index: number | null): this {
    this.index = index;
    return this;
  }

  with_contract_id(contract_id: ContractId | null): this {
    this.contract_id = contract_id;
    return this;
  }
}

// =============================================

export class InputsMessageSubject implements Subject {
  static WILDCARD = 'inputs.>';

  constructor(
    public tx_id: Bytes32 | null = null,
    public index: number | null = null,
    public sender: Address | null = null,
    public recipient: Address | null = null,
  ) {}

  parse(): string {
    return `inputs.${this.tx_id || '*'}.${this.index || '*'}.message.${
      this.sender || '*'
    }.${this.recipient || '*'}`;
  }

  static wildcard(
    tx_id: Bytes32 | null,
    index: number | null,
    sender: Address | null,
    recipient: Address | null,
  ): string {
    return new InputsMessageSubject(tx_id, index, sender, recipient).parse();
  }

  static new(): InputsMessageSubject {
    return new InputsMessageSubject();
  }

  with_tx_id(tx_id: Bytes32 | null): this {
    this.tx_id = tx_id;
    return this;
  }

  with_index(index: number | null): this {
    this.index = index;
    return this;
  }

  with_sender(sender: Address | null): this {
    this.sender = sender;
    return this;
  }

  with_recipient(recipient: Address | null): this {
    this.recipient = recipient;
    return this;
  }
}

// =============================================

// Enum or type alias for IdentifierKind if required
enum IdentifierKind {
  AssetID = 'asset_id',
  ContractID = 'contract_id',
}

export class InputsByIdSubject implements Subject {
  static WILDCARD = 'by_id.inputs.>';

  constructor(
    public id_kind: IdentifierKind | null = null,
    public id_value: Bytes32 | null = null,
  ) {}

  parse(): string {
    return `by_id.inputs.${this.id_kind || '*'}.${this.id_value || '*'}`;
  }

  static wildcard(
    id_kind: IdentifierKind | null,
    id_value: Bytes32 | null,
  ): string {
    return new InputsByIdSubject(id_kind, id_value).parse();
  }

  static new(): InputsByIdSubject {
    return new InputsByIdSubject();
  }

  with_id_kind(id_kind: IdentifierKind | null): this {
    this.id_kind = id_kind;
    return this;
  }

  with_id_value(id_value: Bytes32 | null): this {
    this.id_value = id_value;
    return this;
  }

  // static fromFuelInput(_input: FuelInput): InputsByIdSubject {
  //   if (input.type === FuelInputType.Coin) {
  //     return new InputsByIdSubject(IdentifierKind.AssetID, input.asset_id);
  //   }
  //   const blockHeight = block.header.daHeight.toNumber();
  //   return new InputsByIdSubject(null, blockHeight);
  // }
}
