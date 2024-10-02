import type {
  AddressLike,
  BytesLike,
  ContractIdLike,
  AssetId as FuelAssetId,
} from 'fuels';

export interface Subject {
  parse(): string;
}

export type Bytes32 = BytesLike;
export type Address = AddressLike;
export type AssetId = FuelAssetId;
export type ContractId = ContractIdLike;
export type BlockHeight = number;

export enum IdentifierKind {
  AssetID = 'asset_id',
  ContractID = 'contract_id',
}

export * from './block';
export * from './logs';
export * from './inputs';
