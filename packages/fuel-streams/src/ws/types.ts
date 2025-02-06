import type { GenericRecord } from '../modules/subject-base';

export enum FuelNetwork {
  Local = 'local',
  Staging = 'staging',
  Mainnet = 'mainnet',
  // Testnet = 'testnet',
}

export type SubjectPayload = {
  subject: string;
  params: Record<string, any>;
};

export type ServerRequest = {
  deliverPolicy: string;
  subscribe: SubjectPayload[];
};

export type ServerResponse<R extends GenericRecord> = {
  version: string;
  type: string;
  subject: string;
  payload: R;
};

export type ClientResponse<
  T extends GenericRecord,
  RawT extends GenericRecord,
> = {
  version: string;
  type: string;
  subject: string;
  payload: T;
  rawPayload: RawT;
};

export type ServerMessage =
  | {
      response: ServerResponse<any>;
    }
  | {
      error: string;
    };
