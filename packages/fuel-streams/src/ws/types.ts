import type { GenericRecord } from '../modules/subject-base';
import type { DeliverPolicy } from './deliver-policy';

export enum FuelNetwork {
  Local = 'local',
  Staging = 'staging',
  // Testnet = 'testnet',
  Mainnet = 'mainnet',
}

export interface SubscriptionPayload {
  deliverPolicy: DeliverPolicy;
  subject: string;
  params: Record<string, any>;
}

export type ClientMessageSubscribe = {
  subscribe: {
    deliverPolicy: string;
    subject: string;
    params: Record<string, any>;
  };
};

export type ClientMessageUnsubscribe = {
  unsubscribe: {
    deliverPolicy: string;
    subject: string;
    params: Record<string, any>;
  };
};

export type ClientMessage = ClientMessageSubscribe | ClientMessageUnsubscribe;

export type ServerResponse<R extends GenericRecord> = {
  key: string;
  data: R;
};

export type ClientResponse<
  T extends GenericRecord,
  RawT extends GenericRecord,
> = {
  key: string;
  data: T;
  rawData: RawT;
};

export type ServerMessage =
  | {
      response: ServerResponse<any>;
    }
  | {
      error: string;
    };
