import camelize from 'camelize-ts';
import type { JsonAbi } from 'fuels';
import snakify from 'snakify-ts';
import { v4 as uuidv4 } from 'uuid';
import type { GenericRecord, SubjectBase } from '../modules/subject-base';
import { findParser } from '../parsers';
import type { DeliverPolicy } from './deliver-policy';
import { ClientError } from './error';
import { getWsUrl } from './networks';
import { WebSocket } from './platform';
import type {
  ClientResponse,
  FuelNetwork,
  ServerMessage,
  StreamResponse,
  SubjectPayload,
  SubscribeRequest,
  UnsubscribeRequest,
} from './types';

export interface ConnectionOpts {
  network: FuelNetwork;
  apiKey: string | null;
}

interface SubscriptionIterator<T extends GenericRecord, R extends GenericRecord>
  extends AsyncIterableIterator<ClientResponse<T, R>> {
  onMessage: (handler: (data: ClientResponse<T, R>) => void) => () => void;
  onMessageError: (handler: (error: Error) => void) => () => void;
}

export class Connection {
  private ws: WebSocket;
  private messageHandlers: Map<string, (data: any) => void>;
  private messageErrors: Map<string, (error: Error) => void>;
  private disconnectHandlers: Set<() => void>;
  private isClosing = false;
  private contractAbi?: JsonAbi;

  constructor(ws: WebSocket, contractAbi?: JsonAbi) {
    this.ws = ws;
    this.messageHandlers = new Map();
    this.messageErrors = new Map();
    this.disconnectHandlers = new Set();
    this.contractAbi = contractAbi;

    this.ws.onmessage = async (event) => {
      try {
        const data = await this.parseEventData(event);
        const msg = this.parseJsonMessage(data);

        if ('error' in msg) {
          const clientError = this.handleServerError(msg.error);
          this.messageErrors.forEach((handler) => handler(clientError));
          return;
        }

        if ('response' in msg) {
          this.messageHandlers.forEach((handler) => {
            handler(msg.response);
          });
        }
      } catch (err) {
        const clientError = this.handleError(err);
        this.messageErrors.forEach((handler) => handler(clientError));
      }
    };

    this.ws.onerror = (error) => {
      const wsError = ClientError.WebSocketError(error as unknown as Error);
      this.messageErrors.forEach((handler) => handler(wsError));
    };

    this.ws.onclose = (event) => {
      if (!this.isClosing) {
        const closeError = new ClientError(
          `WebSocket closed: ${event.reason || 'Unknown reason'}`,
        );
        this.messageErrors.forEach((handler) => handler(closeError));
      }
      this.disconnectHandlers.forEach((handler) => handler());
    };
  }

  private async parseEventData(event: MessageEvent): Promise<string> {
    return event.data instanceof Blob
      ? await event.data.text()
      : event.data.toString();
  }

  private parseJsonMessage(data: string): ServerMessage {
    try {
      return camelize<ServerMessage>(JSON.parse(data));
    } catch (err) {
      throw ClientError.JsonParseError(err as SyntaxError);
    }
  }

  private handleServerError(error: string): ClientError {
    return (() => {
      switch (error) {
        case 'unauthorized':
          return ClientError.UnauthorizedError();
        case 'invalid_api_key':
          return ClientError.InvalidApiKey();
        default:
          return new ClientError(error);
      }
    })();
  }

  private handleError(err: unknown): ClientError {
    return (() => {
      if (err instanceof ClientError) {
        return err;
      }
      if (err instanceof SyntaxError) {
        return ClientError.JsonParseError(err);
      }
      return ClientError.ApiError(err as Error);
    })();
  }

  private createSubscriptionIterator<
    T extends GenericRecord,
    R extends GenericRecord,
  >(): SubscriptionIterator<T, R> {
    const abi = this.contractAbi;
    const handlerId = uuidv4();
    return {
      next: () => {
        return new Promise<IteratorResult<ClientResponse<T, R>, any>>(
          (resolve, reject) => {
            const handler = (data: StreamResponse<R>) => {
              try {
                const parser = findParser(data.type);
                resolve({
                  done: false,
                  value: {
                    ...data,
                    payload: parser.parse(data.payload, abi),
                    rawPayload: data.payload,
                  },
                });
              } catch (err) {
                reject(this.handleError(err));
              }
            };
            this.messageHandlers.set(handlerId, handler);
          },
        );
      },
      return: () => {
        this.messageHandlers.delete(handlerId);
        return Promise.resolve({ done: true, value: undefined });
      },
      throw: (error) => {
        this.messageHandlers.delete(handlerId);
        return Promise.reject(error);
      },
      [Symbol.asyncIterator]() {
        return this;
      },
      onMessage: (handler) => {
        const messageHandler = (data: StreamResponse<R>) => {
          try {
            const parser = findParser(data.type);

            const parsedPayload = parser.parse(data.payload, abi);

            handler({
              ...data,
              payload: parsedPayload,
              rawPayload: data.payload,
            });
          } catch (err) {
            console.error('Error parsing message:', err);
            this.handleError(err);
          }
        };
        this.messageHandlers.set(handlerId, messageHandler);
        return () => {
          this.messageHandlers.delete(handlerId);
        };
      },
      onMessageError: (handler) => {
        this.messageErrors.set(handlerId, handler);
        return () => {
          this.messageErrors.delete(handlerId);
        };
      },
    };
  }

  async subscribe<
    S extends SubjectBase<GenericRecord, GenericRecord, GenericRecord>,
    Entity extends ReturnType<S['_entity']> = ReturnType<S['_entity']>,
    RawEntity extends ReturnType<S['_rawEntity']> = ReturnType<S['_rawEntity']>,
  >(
    subjects: S[],
    deliverPolicy: DeliverPolicy,
  ): Promise<SubscriptionIterator<Entity, RawEntity>> {
    try {
      const payloads = subjects.map((subject) => subject.toPayload());

      await this.sendMessage({
        subscribe: payloads,
        deliverPolicy: deliverPolicy.toString(),
      });

      return this.createSubscriptionIterator<Entity, RawEntity>();
    } catch (err) {
      if (err instanceof ClientError) {
        throw err;
      }
      throw ClientError.SubscriptionError(
        subjects.map((s) => s.toString()).join(', '),
      );
    }
  }

  async subscribeWithPayload<
    T extends GenericRecord,
    RawT extends GenericRecord,
  >(
    deliverPolicy: DeliverPolicy,
    payloads: SubjectPayload[],
  ): Promise<SubscriptionIterator<T, RawT>> {
    try {
      const message: SubscribeRequest = {
        deliverPolicy: deliverPolicy.toString(),
        subscribe: payloads,
      };

      await this.sendMessage(message);
      return this.createSubscriptionIterator<T, RawT>();
    } catch (err) {
      if (err instanceof ClientError) {
        throw err;
      }
      throw ClientError.SubscriptionError(
        payloads.map((p) => p.subject).join(', '),
      );
    }
  }

  async unsubscribe(
    deliverPolicy: DeliverPolicy,
    payloads: SubjectPayload[],
  ): Promise<void> {
    try {
      const message: UnsubscribeRequest = {
        deliverPolicy: deliverPolicy.toString(),
        unsubscribe: payloads,
      };
      await this.sendMessage(message);
    } catch (err) {
      if (err instanceof ClientError) {
        throw err;
      }
      throw ClientError.UnsubscriptionError(
        payloads.map((p) => p.subject).join(', '),
      );
    }
  }

  private canSendMessage(): boolean {
    return !this.isClosing && this.ws.readyState === this.ws.OPEN;
  }

  private async sendMessage(
    message: SubscribeRequest | UnsubscribeRequest,
  ): Promise<void> {
    if (!this.canSendMessage()) {
      throw ClientError.WebSocketError(
        new Error('WebSocket connection is not open'),
      );
    }

    return new Promise((resolve, reject) => {
      try {
        if (!message || typeof message !== 'object') {
          throw new Error('Invalid message format');
        }

        const timeoutId = setTimeout(() => {
          reject(
            ClientError.WebSocketError(new Error('Send operation timed out')),
          );
        }, 5000);

        const msg = JSON.stringify(snakify(message));
        this.ws.send(msg);
        clearTimeout(timeoutId);
        resolve();
      } catch (err) {
        if (err instanceof Error) {
          reject(ClientError.WebSocketError(err));
        } else {
          reject(
            ClientError.WebSocketError(
              new Error('Unknown error during message send'),
            ),
          );
        }
      }
    });
  }

  onDisconnect(handler: () => void): () => void {
    this.disconnectHandlers.add(handler);
    return () => {
      this.disconnectHandlers.delete(handler);
    };
  }

  isConnected(): boolean {
    return this.ws.readyState === this.ws.OPEN;
  }

  close() {
    try {
      this.isClosing = true;
      this.messageHandlers.clear();
      this.messageErrors.clear();
      this.disconnectHandlers.clear();
      if (this.ws.readyState === this.ws.OPEN) {
        this.ws.close(1000, 'Closed by client');
      }
    } catch (err) {
      console.error('Error during connection close:', err);
    } finally {
      this.isClosing = false;
    }
  }

  reset() {
    this.messageHandlers.clear();
    this.messageErrors.clear();
  }
}

export type ConnectOpts = {
  abi?: JsonAbi;
};

export class Client {
  private opts: ConnectionOpts;
  private connection: Connection | null;

  private constructor(opts: ConnectionOpts) {
    if (!opts.apiKey) {
      throw ClientError.MissingApiKey();
    }
    this.opts = opts;
    this.connection = null;
  }

  static async connect(
    network: FuelNetwork,
    apiKey: string,
    connectOpts?: ConnectOpts,
  ): Promise<Connection> {
    if (!apiKey) {
      throw ClientError.MissingApiKey();
    }
    const client = new Client({ network, apiKey });
    return client.connectInternal(connectOpts);
  }

  private async connectInternal(
    connectOpts?: ConnectOpts,
  ): Promise<Connection> {
    if (!this.opts.apiKey) {
      throw ClientError.MissingApiKey();
    }

    try {
      const wsUrl = new URL(
        `/api/v1/ws?api_key=${this.opts.apiKey}`,
        getWsUrl(this.opts.network),
      );

      return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl.toString());
        const timeoutId = setTimeout(() => {
          cleanup();
          reject(ClientError.ConnectionTimeout());
        }, 10000);

        const cleanup = () => {
          clearTimeout(timeoutId);
          ws.onopen = null;
          ws.onerror = null;
        };

        ws.onopen = () => {
          cleanup();
          this.connection = new Connection(ws, connectOpts?.abi);
          resolve(this.connection);
        };

        ws.onerror = (event: Event) => {
          cleanup();
          const error = new Error(
            (event as ErrorEvent).message || 'WebSocket connection failed',
          );
          reject(ClientError.WebSocketError(error));
        };
      });
    } catch (err) {
      if (err instanceof ClientError) {
        throw err;
      }
      if (err instanceof TypeError) {
        throw ClientError.UrlParseError(err);
      }
      throw ClientError.NetworkError(this.opts.network);
    }
  }

  isConnected(): boolean {
    return !!this.connection?.isConnected();
  }

  onDisconnect(handler: () => void): () => void {
    if (!this.connection) {
      throw ClientError.WebSocketError(new Error('No active connection'));
    }
    return this.connection.onDisconnect(handler);
  }

  close() {
    this.connection?.close();
    this.connection = null;
  }
}
