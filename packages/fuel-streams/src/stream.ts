import {
  AckPolicy,
  type ConsumerConfig,
  type ConsumerInfo,
  DeliverPolicy,
} from '@nats-io/jetstream';
import type { KV, KvEntry, KvWatchOptions } from '@nats-io/kv';
import type { QueuedIterator } from '@nats-io/nats-core';
import type { SubjectBase } from './modules/subject-base';
import type { Client } from './nats-client';

export { DeliverPolicy };

export interface SubscribeConsumerConfig {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  filterSubjects: Array<SubjectBase<any>>;
  deliverPolicy: DeliverPolicy;
}

export class Stream {
  #store: KV;
  #client: Client;
  #name: string;
  private static streams = new Map<string, Stream>();

  private constructor(name: string, store: KV, client: Client) {
    this.#name = name;
    this.#store = store;
    this.#client = client;
  }

  static async get(client: Client, bucketName: string) {
    const namespace = client.opts?.getNamespace();
    const storeName = namespace?.streamName(bucketName) ?? bucketName;

    if (!Stream.streams.has(storeName)) {
      console.log(`Creating stream for ${storeName}`);
      const store = await client.getOrCreateKvStore(storeName, { history: 1 });
      Stream.streams.set(storeName, new Stream(storeName, store, client));
    }

    return Stream.streams.get(storeName)!;
  }

  getStore(): KV {
    return this.#store;
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
    const status = await this.#store.status();
    const state = status.streamInfo.state;
    const streamName = this.#name;
    const consumers: Array<ConsumerInfo> = [];
    const list = this.#client.getJetstreamManager().consumers.list(streamName);

    for await (const item of list) {
      consumers.push(item);
    }

    return { streamName, consumers, state };
  }

  async getStreamName() {
    return this.#name;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async subscribeWithSubject<S extends SubjectBase<any>>(subject: S) {
    const kvOpts = { key: subject.parse() } as KvWatchOptions;
    return this.#store.watch(kvOpts);
  }

  async subscribe(subject: string) {
    const kvOpts = { key: subject } as KvWatchOptions;
    return this.#store.watch(kvOpts);
  }

  async subscribeConsumer(
    userConfig: Pick<SubscribeConsumerConfig, 'filterSubjects'>,
  ) {
    const config = this.extendConsumerConfig(userConfig);
    const consumer = await this.createConsumer(config);
    return this.#client.getJetstream().consumers.get(consumer.name);
  }

  private extendConsumerConfig(userConfig: Partial<SubscribeConsumerConfig>) {
    return {
      name: `KV_${this.#name}`,
      filter_subjects: userConfig.filterSubjects?.map((i) => i.parse()),
      deliver_policy: DeliverPolicy.New,
      ack_policy: AckPolicy.None,
    } as ConsumerConfig;
  }

  async createConsumer(config: Partial<ConsumerConfig>) {
    const extendedConfig = this.prefixFilterSubjects(config);
    console.log(extendedConfig);
    const streamName = `KV_${this.#name}`;
    return this.#client
      .getJetstreamManager()
      .consumers.add(streamName, extendedConfig);
  }

  async flushAwait() {
    return this.#client.closeSafely();
  }
}

export type Subscription = QueuedIterator<KvEntry>;
export type SubscriptionIterator = AsyncIterator<KvEntry>;
