import {
  AckPolicy,
  type Consumer,
  type ConsumerConfig,
  type ConsumerInfo,
  DeliverPolicy,
  StorageType,
  type StreamState,
} from '@nats-io/jetstream';
import type { KV, KvEntry, KvWatchOptions } from '@nats-io/kv';
import type { QueuedIterator } from '@nats-io/nats-core';
import type { NatsClient } from '../client/natsClient';
import type { StreamData } from './streamData';

export interface SubscribeConsumerConfig {
  filterSubjects: Array<string>;
  deliverPolicy: DeliverPolicy;
}

export abstract class Streameable<T> {
  NAME: string;
  WILDCARD_LIST: string[];
  abstract encode(): Promise<Uint8Array>;
  abstract decode(encoded: Uint8Array): Promise<StreamData<T>>;
}

export class Stream<T> {
  private store: KV;
  private client: NatsClient;
  private static instance: Stream<undefined>;

  private constructor(store: KV, client: NatsClient) {
    this.store = store;
    this.client = client;
  }

  public static async getOrInit<T>(
    client: NatsClient,
    streamable: Streameable<T>,
  ): Promise<Stream<T>> {
    if (!Stream.instance) {
      Stream.instance = await Stream.new<unknown>(client, streamable);
    }
    return Stream.instance as Stream<T>;
  }

  private static async new<T>(
    client: NatsClient,
    streamable: Streameable<T>,
  ): Promise<Stream<T>> {
    const namespace = client.getClientOpts().getNamespace();
    const bucketName = namespace.streamName(streamable.NAME);
    const store = await client.getOrCreateKvStore(bucketName, {
      storage: StorageType.File,
      history: 1,
      compression: true,
    });
    return new Stream<T>(store, client);
  }

  public getStore(): KV {
    return this.store;
  }

  private prefixFilterSubject(subject: string): string {
    return `$KV.*.${subject}`;
  }

  private prefixFilterSubjects(
    config: Partial<ConsumerConfig>,
  ): Partial<ConsumerConfig> {
    config.filter_subjects = config.filter_subjects?.map((subject) =>
      this.prefixFilterSubject(subject),
    );
    return config;
  }

  public async publishMany(
    subjects: string[],
    payload: Streameable<T>,
  ): Promise<void> {
    await Promise.all(
      subjects.map((subject) => this.publish(subject, payload)),
    );
  }

  public async publish(
    subject: string,
    payload: Streameable<T>,
  ): Promise<number> {
    const encodedPayload = await payload.encode();
    try {
      const dataSize = await this.store.create(subject, encodedPayload);
      return dataSize;
    } catch (_e) {
      throw new Error(`Failed to publish data for subject: ${subject}`);
    }
  }

  public async getConsumersAndState(): Promise<{
    streamName: string;
    consumers: Array<ConsumerInfo>;
    state: StreamState;
  }> {
    const status = await this.store.status();
    const state = status.streamInfo.state;
    const streamName = status.streamInfo.config.name;
    const consumers: Array<ConsumerInfo> = [];
    for await (const cons of this.client
      .getJetstreamManager()
      .consumers.list(streamName)) {
      consumers.push(cons);
    }
    return { streamName, consumers, state };
  }

  public async getStreamName(): Promise<string> {
    return (await this.store.status()).streamInfo.config.name;
  }

  public async subscribe(wildcard: string): Promise<QueuedIterator<KvEntry>> {
    const kvOpts = { key: wildcard } as KvWatchOptions;
    const subscription = await this.store.watch(kvOpts);
    return subscription;
  }

  public async subscribeConsumer(
    userConfig: Partial<SubscribeConsumerConfig>,
  ): Promise<Consumer> {
    const config = this.extendConsumerConfig(userConfig);
    const consumer = await this.createConsumer(config);
    const consumerHandle = await this.client
      .getJetstream()
      .consumers.get(consumer.name);
    return consumerHandle;
  }

  private extendConsumerConfig(
    userConfig: Partial<SubscribeConsumerConfig>,
  ): Partial<ConsumerConfig> {
    return {
      filter_subjects: userConfig.filterSubjects,
      deliver_policy: userConfig.deliverPolicy || DeliverPolicy.All,
      ack_policy: AckPolicy.None,
    } as ConsumerConfig;
  }

  public async createConsumer(
    config: Partial<ConsumerConfig>,
  ): Promise<ConsumerInfo> {
    const extendedConfig = this.prefixFilterSubjects(config);
    const status = await this.store.status();
    const streamName = status.streamInfo.config.name;
    const consumerInfo = await this.client
      .getJetstreamManager()
      .consumers.add(streamName, extendedConfig);
    return consumerInfo;
  }

  public async flushAwait(): Promise<boolean> {
    return await this.client.closeSafely();
  }
}
