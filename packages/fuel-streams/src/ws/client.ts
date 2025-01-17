import type {
  EntityParser,
  GenericRecord,
  SubjectBase,
} from '../modules/subject-base';
import {
  BlockParser,
  InputParser,
  LogParser,
  OutputParser,
  ReceiptParser,
  TransactionParser,
  UtxoParser,
} from '../parsers';
import { ClientError } from './error';
import { getWsUrl } from './networks';
import { WebSocket } from './platform';
import type {
  ClientMessage,
  DeliverPolicy,
  FuelNetwork,
  ResponseMessage,
  ServerMessage,
} from './types';

export interface ConnectionOpts {
  network: FuelNetwork;
  apiKey: string | null;
}

interface SubscriptionIterator<T extends GenericRecord>
  extends AsyncIterableIterator<ResponseMessage<T>> {
  onMessage: (handler: (data: ResponseMessage<T>) => void) => () => void;
}

export class Connection {
  private ws: WebSocket;
  private messageHandlers: Map<string, (data: any) => void>;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.messageHandlers = new Map();

    this.ws.onmessage = async (event) => {
      try {
        const data =
          event.data instanceof Blob
            ? await event.data.text()
            : event.data.toString();

        const msg = JSON.parse(data) as ServerMessage;
        if ('error' in msg) {
          // Handle specific server error types
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
  }

  private createSubscriptionIterator<
    S extends SubjectBase<GenericRecord, GenericRecord, GenericRecord>,
    T extends ReturnType<S['_entity']>,
    RawT extends ReturnType<S['_rawEntity']>,
  >(subject: string, parser: EntityParser<T, RawT>): SubscriptionIterator<T> {
    return {
      next: () => {
        return new Promise((resolve) => {
          const handler = (data: any) => {
            const payload = parser.parse(data.payload);
            resolve({ value: { subject: data.subject, payload }, done: false });
          };
          this.messageHandlers.set(subject, handler);
        });
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
        function pred(data: ResponseMessage<RawT>) {
          const payload = parser.parse(data.payload);
          handler({ subject: data.subject, payload });
        }
        this.messageHandlers.set(subject, pred);
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
  ): Promise<SubscriptionIterator<Entity>> {
    try {
      const parsedSubject = subject.parse();
      const parser = subject.entityParser() as EntityParser<Entity, RawEntity>;
      const message: ClientMessage = {
        subscribe: {
          wildcard: parsedSubject,
          deliverPolicy: deliverPolicy,
        },
      };

      await this.sendMessage(message);
      return this.createSubscriptionIterator<S, Entity, RawEntity>(
        parsedSubject,
        parser,
      );
    } catch (err) {
      if (err instanceof ClientError) {
        throw err;
      }
      throw ClientError.SubscriptionError(subject.toString());
    }
  }

  async subscribeWithString<
    T extends GenericRecord,
    RawT extends GenericRecord,
  >(
    subject: string,
    deliverPolicy: DeliverPolicy,
  ): Promise<SubscriptionIterator<T>> {
    try {
      const message: ClientMessage = {
        subscribe: {
          wildcard: subject,
          deliverPolicy: deliverPolicy,
        },
      };

      await this.sendMessage(message);
      const parser = this.findParser(subject);
      return this.createSubscriptionIterator<any, T, RawT>(subject, parser);
    } catch (err) {
      if (err instanceof ClientError) {
        throw err;
      }
      throw ClientError.SubscriptionError(subject);
    }
  }

  private findParser(subject: string): EntityParser<any, any> {
    const parserMap: Record<string, new () => EntityParser<any, any>> = {
      blocks: BlockParser,
      transactions: TransactionParser,
      inputs: InputParser,
      outputs: OutputParser,
      receipts: ReceiptParser,
      utxos: UtxoParser,
      logs: LogParser,
    };

    const matchingKey = Object.keys(parserMap).find((key) =>
      subject.includes(key),
    );
    if (!matchingKey) {
      throw new Error(`No parser found for subject: ${subject}`);
    }

    return new parserMap[matchingKey]();
  }

  private async sendMessage(message: ClientMessage): Promise<void> {
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

  close() {
    this.messageHandlers.clear();
    this.ws.close();
  }
}

export class Client {
  private opts: ConnectionOpts;

  private constructor(opts: ConnectionOpts) {
    if (!opts.apiKey) {
      throw ClientError.MissingApiKey();
    }
    this.opts = opts;
  }

  static async new(network: FuelNetwork, apiKey: string): Promise<Client> {
    if (!apiKey) {
      throw ClientError.MissingApiKey();
    }
    return new Client({
      network,
      apiKey,
    });
  }

  async connect(): Promise<Connection> {
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
          resolve(new Connection(ws));
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
}
