import type {
  EntityParser,
  GenericRecord,
  SubjectBase,
} from '../modules/subject-base';
import {
  BlockParser,
  InputParser,
  OutputParser,
  ReceiptParser,
  TransactionParser,
  UtxoParser,
} from '../parsers';
import type { DeliverPolicy } from './deliver-policy';
import { ClientError } from './error';
import { getWsUrl } from './networks';
import { WebSocket } from './platform';
import type {
  ClientResponse,
  FuelNetwork,
  ServerMessage,
  ServerRequest,
  ServerResponse,
  SubjectPayload,
} from './types';

export interface ConnectionOpts {
  network: FuelNetwork;
  apiKey: string | null;
}

interface SubscriptionIterator<T extends GenericRecord, R extends GenericRecord>
  extends AsyncIterableIterator<ClientResponse<T, R>> {
  onMessage: (handler: (data: ClientResponse<T, R>) => void) => () => void;
}

export class Connection {
  private ws: WebSocket;
  private messageHandlers: Map<string, (data: any) => void>;
  private disconnectHandlers: Set<() => void>;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.messageHandlers = new Map();
    this.disconnectHandlers = new Set();

    this.ws.onmessage = async (event) => {
      try {
        const data =
          event.data instanceof Blob
            ? await event.data.text()
            : event.data.toString();
        console.log(data);
        const msg = JSON.parse(data) as ServerMessage;
        if ('error' in msg) {
          switch (msg.error) {
            case 'unauthorized':
              throw ClientError.UnauthorizedError();
            case 'invalid_api_key':
              throw ClientError.InvalidApiKey();
            default:
              throw new ClientError(msg.error);
          }
        }

        if ('response' in msg) {
          this.messageHandlers.forEach((handler) => handler(msg.response));
        }
      } catch (err) {
        if (err instanceof ClientError) {
          throw err;
        }
        if (err instanceof SyntaxError) {
          throw ClientError.JsonParseError(err);
        }
        throw ClientError.ApiError(err as Error);
      }
    };

    this.ws.onerror = (error) => {
      throw ClientError.WebSocketError(error as unknown as Error);
    };

    this.ws.onclose = () => {
      this.disconnectHandlers.forEach((handler) => handler());
    };
  }

  private createSubscriptionIterator<
    S extends SubjectBase<GenericRecord, GenericRecord, GenericRecord>,
    T extends ReturnType<S['_entity']>,
    R extends ReturnType<S['_rawEntity']>,
  >(subject: string, parser: EntityParser<T, R>): SubscriptionIterator<T, R> {
    return {
      next: () => {
        return new Promise<IteratorResult<ClientResponse<T, R>, any>>(
          (resolve) => {
            const handler = (data: ServerResponse<R>) => {
              resolve({
                done: false,
                value: {
                  ...data,
                  payload: parser.parse(data.payload),
                  rawPayload: data.payload,
                },
              });
            };
            this.messageHandlers.set(subject, handler);
          },
        );
      },
      return: () => {
        this.messageHandlers.delete(subject);
        return Promise.resolve({ done: true, value: undefined });
      },
      throw: (error) => {
        this.messageHandlers.delete(subject);
        return Promise.reject(error);
      },
      [Symbol.asyncIterator]() {
        return this;
      },
      onMessage: (handler) => {
        const messageHandler = (data: ServerResponse<R>) => {
          handler({
            ...data,
            payload: parser.parse(data.payload),
            rawPayload: data.payload,
          });
        };
        this.messageHandlers.set(subject, messageHandler);
        return () => {
          this.messageHandlers.delete(subject);
        };
      },
    };
  }

  async subscribe<
    S extends SubjectBase<GenericRecord, GenericRecord, GenericRecord>,
    Entity extends ReturnType<S['_entity']> = ReturnType<S['_entity']>,
    RawEntity extends ReturnType<S['_rawEntity']> = ReturnType<S['_rawEntity']>,
  >(
    subject: S,
    deliverPolicy: DeliverPolicy,
  ): Promise<SubscriptionIterator<Entity, RawEntity>> {
    try {
      const parser = subject.parser as EntityParser<Entity, RawEntity>;
      const payload = subject.toPayload();
      await this.sendMessage({
        subscribe: [payload],
        deliverPolicy: deliverPolicy.toString(),
      });

      return this.createSubscriptionIterator<S, Entity, RawEntity>(
        payload.subject,
        parser,
      );
    } catch (err) {
      if (err instanceof ClientError) {
        throw err;
      }
      throw ClientError.SubscriptionError(subject.toString());
    }
  }

  async subscribeWithPayload<
    T extends GenericRecord,
    RawT extends GenericRecord,
  >(
    deliverPolicy: DeliverPolicy,
    payload: SubjectPayload,
  ): Promise<SubscriptionIterator<T, RawT>> {
    try {
      const message: ServerRequest = {
        deliverPolicy: deliverPolicy.toString(),
        subscribe: [payload],
      };

      await this.sendMessage(message);
      const parser = this.findParser(payload.subject);
      return this.createSubscriptionIterator<any, T, RawT>(
        payload.subject,
        parser,
      );
    } catch (err) {
      if (err instanceof ClientError) {
        throw err;
      }
      throw ClientError.SubscriptionError(payload.subject);
    }
  }

  private findParser(subject: string): EntityParser<any, any> {
    const parserMap: Record<string, new () => EntityParser<any, any>> = {
      block: BlockParser,
      transaction: TransactionParser,
      input: InputParser,
      output: OutputParser,
      receipt: ReceiptParser,
      utxo: UtxoParser,
    };

    const matchingKey = Object.keys(parserMap).find((key) =>
      subject.includes(key),
    );
    if (!matchingKey) {
      throw new Error(`No parser found for subject: ${subject}`);
    }

    return new parserMap[matchingKey]();
  }

  private async sendMessage(message: ServerRequest): Promise<void> {
    if (this.ws.readyState !== this.ws.OPEN) {
      throw ClientError.WebSocketError(
        new Error('WebSocket connection is not open'),
      );
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws.send(JSON.stringify(message));
        resolve();
      } catch (err) {
        reject(ClientError.WebSocketError(err as Error));
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
    this.messageHandlers.clear();
    this.disconnectHandlers.clear();
    this.ws.close();
  }
}

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
  ): Promise<Connection> {
    if (!apiKey) {
      throw ClientError.MissingApiKey();
    }
    const client = new Client({ network, apiKey });
    return client.connectInternal();
  }

  private async connectInternal(): Promise<Connection> {
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
        }, 10000); // 10 second timeout

        const cleanup = () => {
          clearTimeout(timeoutId);
          ws.onopen = null;
          ws.onerror = null;
        };

        ws.onopen = () => {
          cleanup();
          this.connection = new Connection(ws);
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
