import {
  AckPolicy,
  type ConsumerConfig,
  type ConsumerInfo,
  DeliverPolicy,
} from '@nats-io/jetstream';
import type { KV } from '@nats-io/kv';
import type { SubjectBase } from './modules/subject-base';
import type { Client } from './nats-client';

export { DeliverPolicy };

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type GenericRecord = Record<string, any>;
export type StreamData<T, R> = {
  subject: string;
  timestamp: string;
  payload: T;
  rawPayload: R;
};

export interface SubscribeConsumerConfig<C extends Array<unknown>> {
  filterSubjects: C;
  deliverPolicy: DeliverPolicy;
}

export type StreamIterator<T extends StreamData<unknown, unknown>> =
  AsyncIterableIterator<T>;

export interface StreamParser<
  T extends GenericRecord,
  R extends GenericRecord,
> {
  parse(data: R): T;
}

export class Stream<T extends GenericRecord, R extends GenericRecord> {
  public constructor(
    private name: string,
    private store: KV,
    private client: Client,
    private parser: StreamParser<T, R>,
  ) {}

  static async get<C extends GenericRecord, R extends GenericRecord>(
    client: Client,
    bucketName: string,
    parser: StreamParser<C, R>,
  ) {
    const storeName = client.opts?.streamName(bucketName) ?? bucketName;
    const store = await client.getOrCreateKvStore(storeName);
    return new Stream<C, R>(storeName, store, client, parser);
  }

  getStore(): KV {
    return this.store;
  }

  private prefixFilterSubject(subject: string) {
    return `$KV.*.${subject}`;
  }

  private prefixFilterSubjects(config: Partial<ConsumerConfig>) {
    config.filter_subjects = config.filter_subjects?.map((subject) =>
      this.prefixFilterSubject(subject),
    );
    return config;
  }

  async getConsumersAndState() {
    const status = await this.store.status();
    const state = status.streamInfo.state;
    const streamName = this.name;
    const consumers: Array<ConsumerInfo> = [];
    const list = this.client.jetStreamManager.consumers.list(streamName) ?? [];

    for await (const item of list) {
      consumers.push(item);
    }

    return { streamName, consumers, state };
  }

  async getStreamName() {
    return this.name;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async subscribe<S extends SubjectBase<any>>(
    subject: S,
    deliverPolicy: DeliverPolicy = DeliverPolicy.New,
  ) {
    return this.subscribeConsumer({ filterSubjects: [subject], deliverPolicy });
  }

  async subscribeWithString(
    subject: string,
    deliverPolicy: DeliverPolicy = DeliverPolicy.New,
  ) {
    return this.subscribeConsumer({ filterSubjects: [subject], deliverPolicy });
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async subscribeConsumer<C extends Array<string | SubjectBase<any>>>(
    userConfig: SubscribeConsumerConfig<C>,
  ): Promise<StreamIterator<StreamData<T, R>>> {
    const opts = {
      deliver_policy: userConfig.deliverPolicy,
      filter_subjects: userConfig.filterSubjects?.map((subject) => {
        return typeof subject === 'object' && 'parse' in subject
          ? subject.parse()
          : subject;
      }),
    } as Partial<ConsumerConfig>;
    console.log('opts', opts);
    const consumer = await this.createConsumer(opts);

    const parser = this.parser;
    const iterator = await consumer.consume();
    const asyncIterator: StreamIterator<StreamData<T, R>> = {
      async *[Symbol.asyncIterator]() {
        for await (const msg of iterator) {
          const data = msg.json() as {
            subject: string;
            payload: R;
            timestamp: string;
          };
          const payload = parser.parse(data.payload);
          yield { ...data, payload, rawPayload: data.payload };
        }
      },
      next: async () => {
        for await (const msg of iterator) {
          const data = msg.json() as {
            subject: string;
            payload: R;
            timestamp: string;
          };
          const payload = parser.parse(data.payload);
          // const payload = data.payload;
          return {
            done: false,
            value: { ...data, payload, rawPayload: data.payload },
          };
        }
        return { done: true, value: undefined };
      },
      return: async () => {
        iterator.stop();
        return { done: true, value: undefined };
      },
      throw: async (error: Error) => {
        iterator.stop();
        throw error;
      },
    };

    return asyncIterator;
  }

  async createConsumer(config: Partial<ConsumerConfig>) {
    const extendedConfig = this.prefixFilterSubjects(config);
    const streamName = this.getKvStreamName();
    return this.client.jetStream.consumers.getPushConsumer(
      streamName,
      extendedConfig,
    );
  }

  async flushAwait() {
    return this.client.closeSafely();
  }

  private getKvStreamName() {
    return `KV_${this.name}`;
  }
}
