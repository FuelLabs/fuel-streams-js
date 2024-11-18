/**
 * @module Stream
 */

import {
  AckPolicy,
  type ConsumerConfig,
  type ConsumerInfo,
  DeliverPolicy,
} from '@nats-io/jetstream';
import type { KV, KvWatchOptions } from '@nats-io/kv';
import type { Client } from '../client/natsClient';
import type { Subject } from '../data';
import { StreamData } from './streamData';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type GenericRecord = Record<string, any>;
export { DeliverPolicy };

/**
 * Abstract base class for streamable objects.
 * @template T - Type extending GenericRecord
 */
export abstract class Streameable<T extends GenericRecord> {
  /**
   * Get the name of the stream.
   * @returns The name of the stream
   */
  abstract name(): string;

  /**
   * Get the wildcards for the stream.
   * @returns Array of wildcards
   */
  abstract wildcards(): string[];

  /**
   * Decode the encoded data.
   * @param {Uint8Array} encoded - The encoded data
   * @returns The decoded data
   */
  decode(encoded: Uint8Array): T {
    const data = new StreamData(encoded);
    return data.decode() as T;
  }
}

/**
 * Abstract base class extending {@link Streameable} with additional functionality.
 * @template T - Type extending GenericRecord
 * @template W - Type extending Record<string, string>
 * @extends {Streameable<T>}
 */
export abstract class BaseStreameable<
  T extends GenericRecord,
  W extends Record<string, string>,
> extends Streameable<T> {
  /**
   * @param {T} payload - The payload data
   * @param {string} streamName - The name of the stream
   * @param {W} wildcardEnum - The wildcard enum
   */
  constructor(
    public payload: T,
    private streamName: string,
    private wildcardEnum: W,
  ) {
    super();
  }

  /**
   * @inheritdoc
   */
  name(): string {
    return this.streamName;
  }

  /**
   * @inheritdoc
   */
  wildcards(): string[] {
    return Object.values(this.wildcardEnum);
  }
}

/**
 * Factory class for creating {@link Stream} instances.
 * @template S - Type extending {@link Streameable}<GenericRecord>
 */
export class StreamFactory<S extends Streameable<GenericRecord>> {
  stream: Stream<S>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private static instance: StreamFactory<any>;
  private constructor(readonly bucketName: string) {}

  /**
   * Get or create a StreamFactory instance.
   * @template S - Type extending {@link Streameable}<GenericRecord>
   * @param {string} name - The name of the bucket
   * @returns The StreamFactory instance
   */
  public static get<S extends Streameable<GenericRecord>>(
    name: string,
  ): StreamFactory<S> {
    if (!StreamFactory.instance) {
      StreamFactory.instance = new StreamFactory<S>(name);
    }
    return StreamFactory.instance as StreamFactory<S>;
  }

  /**
   * Initialize the stream.
   * @param {Client} client - The client instance
   * @returns The initialized stream
   */
  async init(client: Client) {
    this.stream = await Stream.create<S>(client, this.bucketName);
    return this.stream;
  }
}

/**
 * Interface for subscribe consumer configuration.
 */
export interface SubscribeConsumerConfig {
  /** Array of filter subjects */
  filterSubjects: Array<Subject>;
  /** Delivery policy */
  deliverPolicy: DeliverPolicy;
}

/**
 * Class representing a stream.
 * @template _T - Type extending {@link Streameable}<GenericRecord>
 */
export class Stream<_T extends Streameable<GenericRecord>> {
  #store: KV;
  #client: Client;
  #name: string;

  /**
   * @param {string} name - The name of the stream
   * @param {KV} store - The KV store
   * @param {Client} client - The client instance
   */
  constructor(name: string, store: KV, client: Client) {
    this.#name = name;
    this.#store = store;
    this.#client = client;
  }

  /**
   * Create a new Stream instance.
   * @template _T - Type extending {@link Streameable}<GenericRecord>
   * @param {Client} client - The client instance
   * @param {string} bucketName - The name of the bucket
   * @returns The created Stream instance
   */
  static async create<_T extends Streameable<GenericRecord>>(
    client: Client,
    bucketName: string,
  ) {
    const namespace = client.opts?.getNamespace();
    const storeName = namespace?.streamName(bucketName) ?? bucketName;
    const store = await client.getOrCreateKvStore(storeName, { history: 1 });
    return new Stream(storeName, store, client);
  }

  /**
   * Get the KV store.
   * @returns The KV store
   */
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

  /**
   * Get consumers and state information.
   * @returns The consumers and state information
   */
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

  /**
   * Get the stream name.
   * @returns The stream name
   */
  async getStreamName() {
    return this.#name;
  }

  /**
   * Subscribe to a subject.
   * @template S - Type extending Subject
   * @param {S} subject - The subject to subscribe to
   * @returns An async iterable of KV entries
   */
  async subscribe<S extends Subject>(subject: S) {
    const kvOpts = { key: subject.parse() } as KvWatchOptions;
    return this.#store.watch(kvOpts);
  }

  /**
   * Subscribe to a consumer.
   * @param {Partial<SubscribeConsumerConfig>} userConfig - The user configuration
   * @returns The JetStream pull subscription
   */
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

  /**
   * Create a consumer.
   * @param {Partial<ConsumerConfig>} config - The consumer configuration
   * @returns The created consumer info
   */
  async createConsumer(config: Partial<ConsumerConfig>) {
    const extendedConfig = this.prefixFilterSubjects(config);
    console.log(extendedConfig);
    const streamName = `KV_${this.#name}`;
    return this.#client
      .getJetstreamManager()
      .consumers.add(streamName, extendedConfig);
  }

  /**
   * Flush and await completion.
   */
  async flushAwait() {
    return this.#client.closeSafely();
  }
}
