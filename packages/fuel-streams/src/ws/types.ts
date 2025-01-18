import type { GenericRecord } from '../modules/subject-base';

export enum FuelNetwork {
  Local = 'local',
  Staging = 'staging',
  Testnet = 'testnet',
  Mainnet = 'mainnet',
}

export interface SubscriptionPayload {
  deliverPolicy: DeliverPolicy;
  subject: string;
  params: Record<string, any>;
}

export enum DeliverPolicy {
  All = 'from_block:0',
  New = 'new',
}

export type ClientMessage =
  | {
      subscribe: SubscriptionPayload;
    }
  | {
      unsubscribe: SubscriptionPayload;
    };

export type ResponseMessage<T extends GenericRecord> = {
  subject: string;
  payload: T;
};

export type ServerMessage =
  | {
      response: ResponseMessage<any>;
    }
  | {
      error: string;
    };
