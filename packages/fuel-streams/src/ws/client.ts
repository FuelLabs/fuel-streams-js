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
import { getWebUrl, getWsUrl } from './networks';
import { WebSocket, fetch } from './platform';
import type {
  ClientMessage,
  DeliverPolicy,
  FuelNetwork,
  LoginRequest,
  LoginResponse,
  ResponseMessage,
  ServerMessage,
} from './types';

export interface ConnectionOpts {
  network: FuelNetwork;
  username: string;
  password: string;
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
        if ('response' in msg) {
          this.messageHandlers.forEach((handler) => handler(msg.response));
        } else if ('error' in msg) {
          throw new ClientError(msg.error as string);
        }
      } catch (err) {
        console.error('Failed to handle message:', err);
      }
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
  }

  async subscribeWithString<
    T extends GenericRecord,
    RawT extends GenericRecord,
  >(
    subject: string,
    deliverPolicy: DeliverPolicy,
  ): Promise<SubscriptionIterator<T>> {
    const message: ClientMessage = {
      subscribe: {
        wildcard: subject,
        deliverPolicy: deliverPolicy,
      },
    };

    await this.sendMessage(message);
    const parser = this.findParser(subject);
    return this.createSubscriptionIterator<any, T, RawT>(subject, parser);
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
      throw new ClientError('WebSocket is not connected');
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
  private jwtToken?: string;
  private static instance: Client | null = null;

  private constructor(opts: ConnectionOpts) {
    this.opts = opts;
  }

  static async getInstance(network: FuelNetwork) {
    if (!Client.instance) {
      Client.instance = new Client({
        network,
        username: 'admin',
        password: 'admin',
      });
    }
    return Client.instance;
  }

  static async new(network: FuelNetwork): Promise<Client> {
    return Client.getInstance(network);
  }

  private async fetchJwt(): Promise<string> {
    const response = await fetch(
      new URL('/api/v1/jwt', getWebUrl(this.opts.network)).toString(),
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.opts.username,
          password: this.opts.password,
        } as LoginRequest),
      },
    );

    if (!response.ok) {
      throw ClientError.ApiError(
        new Error(`HTTP error! status: ${response.status}`),
      );
    }

    const data = (await response.json()) as LoginResponse;
    return data.jwtToken;
  }

  async connect(): Promise<Connection> {
    if (!this.jwtToken) {
      this.jwtToken = await this.fetchJwt();
    }

    const wsUrl = new URL(
      `/api/v1/ws?token=${this.jwtToken}`,
      getWsUrl(this.opts.network),
    );

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl.toString());

      const cleanup = () => {
        ws.onopen = null;
        ws.onerror = null;
      };

      ws.onopen = () => {
        cleanup();
        resolve(new Connection(ws));
      };

      ws.onerror = (event: Event) => {
        cleanup();
        // Convert Event to Error with proper type casting
        const error = new Error(
          (event as ErrorEvent).message || 'WebSocket connection failed',
        );
        reject(ClientError.WebSocketError(error));
      };
    });
  }

  async refreshJwtAndConnect(): Promise<Connection> {
    this.jwtToken = await this.fetchJwt();
    return this.connect();
  }
}
