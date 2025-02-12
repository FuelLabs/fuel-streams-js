import type { GenericRecord } from '../modules/subject-base';

export enum FuelNetwork {
  Local = 'local',
  Staging = 'staging',
  Mainnet = 'mainnet',
}

export type SubjectPayload = {
  subject: string;
  params: Record<string, any>;
};

export type SubscribeRequest = {
  deliverPolicy: string;
  subscribe: SubjectPayload[];
};

export type UnsubscribeRequest = {
  deliverPolicy: string;
  unsubscribe: SubjectPayload[];
};

export type StreamResponse<R extends GenericRecord> = {
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
  | { response: StreamResponse<any> }
  | { error: string };
