import {
  AckPolicy,
  type ConsumerConfig,
  type ConsumerInfo,
  type ConsumerMessages,
  DeliverPolicy,
} from '@nats-io/jetstream';
import type { KV } from '@nats-io/kv';
import type { SubjectBase } from './modules/subject-base';
import type { Client } from './nats-client';

export { DeliverPolicy };

export interface SubscribeConsumerConfig<C extends Array<unknown>> {
  filterSubjects: C;
}

export class Stream {
  private store: KV;
  private client: Client;
  private name: string;
  private static streams = new Map<string, Stream>();

  private constructor(name: string, store: KV, client: Client) {
    this.name = name;
    this.store = store;
    this.client = client;
  }

  static async get(client: Client, bucketName: string) {
    const storeName = client.opts?.streamName(bucketName) ?? bucketName;

    if (!Stream.streams.has(storeName)) {
      console.log(`Creating stream for ${storeName}`);
      const store = await client.getOrCreateKvStore(storeName);
      Stream.streams.set(storeName, new Stream(storeName, store, client));
    }

    return Stream.streams.get(storeName)!;
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
  async subscribe<S extends SubjectBase<any>>(subject: S) {
    const consumer = await this.subscribeConsumer({
      filterSubjects: [subject],
    });
    return consumer.consume();
  }

  async subscribeWithString(subject: string) {
    const consumer = await this.subscribeConsumer({
      filterSubjects: [subject],
    });
    return consumer.consume();
  }

  async subscribeConsumer<C extends Array<unknown>>(
    userConfig: SubscribeConsumerConfig<C>,
  ) {
    return this.createConsumer({
      ack_policy: AckPolicy.None,
      deliver_policy: DeliverPolicy.New,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      filter_subjects: userConfig.filterSubjects?.map((i: any) => {
        return typeof i.parse === 'function' ? i.parse() : i;
      }),
    });
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

export type Subscription = ConsumerMessages;
