import type { GenericRecord } from 'src/modules/subject-base';

export enum FuelNetwork {
  Local = 'local',
  Staging = 'staging',
  Testnet = 'testnet',
  Mainnet = 'mainnet',
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  jwtToken: string;
}

export interface SubscriptionPayload {
  wildcard: string;
  deliverPolicy: DeliverPolicy;
}

export enum DeliverPolicy {
  All = 'all',
  Last = 'last',
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
