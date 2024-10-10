import {
  AckPolicy,
  type ConsumerConfig,
  type ConsumerInfo,
  DeliverPolicy,
} from '@nats-io/jetstream';
import type { KV, KvWatchOptions } from '@nats-io/kv';
import type { Client } from '../client/natsClient';
import type { StreamData } from './streamData';

export interface SubscribeConsumerConfig {
  filterSubjects: Array<string>;
  deliverPolicy: DeliverPolicy;
}

export abstract class Streameable<T> {
  abstract encode(): Promise<Uint8Array>;
  abstract decode(encoded: Uint8Array): Promise<StreamData<T>>;
  abstract name(): string;
  abstract queryAll(): string;
  abstract wildcards(): string[];
}

export class Stream<T extends Streameable<unknown>> {
  #store: KV;
  #client: Client;
  #name: string;

  constructor(name: string, store: KV, client: Client) {
    this.#name = name;
    this.#store = store;
    this.#client = client;
  }

  static async create<T extends Streameable<unknown>>(
    client: Client,
    bucketName: string,
  ) {
    const namespace = client.opts?.getNamespace();
    const storeName = namespace?.streamName(bucketName) ?? bucketName;
    const store = await client.getOrCreateKvStore(storeName, { history: 1 });
    return new Stream(storeName, store, client) as Stream<T>;
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

  async publishMany(subjects: string[], payload: Streameable<T>) {
    await Promise.all(
      subjects.map((subject) => this.publish(subject, payload)),
    );
  }

  async publish(subject: string, payload: Streameable<T>) {
    const encodedPayload = await payload.encode();
    try {
      const dataSize = await this.#store.create(subject, encodedPayload);
      return dataSize;
    } catch (_e) {
      throw new Error(`Failed to publish data for subject: ${subject}`);
    }
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

  async subscribe(wildcard: string) {
    const kvOpts = { key: wildcard } as KvWatchOptions;
    const subscription = await this.#store.watch(kvOpts);
    return subscription;
  }

  async subscribeConsumer(userConfig: Partial<SubscribeConsumerConfig>) {
    const config = this.extendConsumerConfig(userConfig);
    const consumer = await this.createConsumer(config);
    const consumerHandle = await this.#client
      .getJetstream()
      .consumers.get(consumer.name);
    return consumerHandle;
  }

  private extendConsumerConfig(userConfig: Partial<SubscribeConsumerConfig>) {
    return {
      filter_subjects: userConfig.filterSubjects,
      deliver_policy: userConfig.deliverPolicy ?? DeliverPolicy.All,
      ack_policy: AckPolicy.None,
    } as ConsumerConfig;
  }

  async createConsumer(config: Partial<ConsumerConfig>) {
    const extendedConfig = this.prefixFilterSubjects(config);
    const streamName = `KV_${this.#name}`;
    return this.#client
      .getJetstreamManager()
      .consumers.add(streamName, extendedConfig);
  }

  async flushAwait() {
    return this.#client.closeSafely();
  }
}
