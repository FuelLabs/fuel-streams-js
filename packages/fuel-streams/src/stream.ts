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
    const storeName = client.opts?.streamName(bucketName) ?? bucketName;

    if (!Stream.streams.has(storeName)) {
      console.log(`Creating stream for ${storeName}`);
      const store = await client.getOrCreateKvStore(storeName);
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
    const list = this.#client.jetStreamManager.consumers.list(streamName) ?? [];

    for await (const item of list) {
      consumers.push(item);
    }

    return { streamName, consumers, state };
  }

  async getStreamName() {
    return this.#name;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async subscribe<S extends SubjectBase<any>>(subject: S) {
    const kvOpts = { key: subject.parse() } as KvWatchOptions;
    return this.#store.watch(kvOpts);
  }

  async subscribeConsumer(
    userConfig: Pick<SubscribeConsumerConfig, 'filterSubjects'>,
  ) {
    return this.createConsumer({
      filter_subjects: userConfig.filterSubjects?.map((i) => i.parse()),
      deliver_policy: DeliverPolicy.New,
      ack_policy: AckPolicy.None,
    });
  }

  async createConsumer(config: Partial<ConsumerConfig>) {
    const extendedConfig = this.prefixFilterSubjects(config);
    const streamName = this.getKvStreamName();
    return this.#client.jetStream.consumers.getPushConsumer(
      streamName,
      extendedConfig,
    );
  }

  async flushAwait() {
    return this.#client.closeSafely();
  }

  private getKvStreamName() {
    return `KV_${this.#name}`;
  }
}

export type Subscription = QueuedIterator<KvEntry>;
export type SubscriptionIterator = AsyncIterator<KvEntry>;
