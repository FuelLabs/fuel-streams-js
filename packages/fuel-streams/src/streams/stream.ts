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

export abstract class Streameable<T extends GenericRecord> {
  abstract name(): string;
  abstract wildcards(): string[];
  decode(encoded: Uint8Array): T {
    const data = new StreamData(encoded);
    return data.decode() as T;
  }
}

export abstract class BaseStreameable<
  T extends GenericRecord,
  W extends Record<string, string>,
> extends Streameable<T> {
  constructor(
    public payload: T,
    private streamName: string,
    private wildcardEnum: W,
  ) {
    super();
  }

  name(): string {
    return this.streamName;
  }

  wildcards(): string[] {
    return Object.values(this.wildcardEnum);
  }
}

export class StreamFactory<S extends Streameable<GenericRecord>> {
  #stream: Stream<S>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private static instance: StreamFactory<any>;
  private constructor(readonly bucketName: string) {}

  public static get<S extends Streameable<GenericRecord>>(
    name: string,
  ): StreamFactory<S> {
    if (!StreamFactory.instance) {
      StreamFactory.instance = new StreamFactory<S>(name);
    }
    return StreamFactory.instance as StreamFactory<S>;
  }

  async init(client: Client) {
    this.#stream = await Stream.create<S>(client, this.bucketName);
    return this.#stream;
  }
}

export interface SubscribeConsumerConfig {
  filterSubjects: Array<Subject>;
  deliverPolicy: DeliverPolicy;
}

export class Stream<_T extends Streameable<GenericRecord>> {
  #store: KV;
  #client: Client;
  #name: string;

  constructor(name: string, store: KV, client: Client) {
    this.#name = name;
    this.#store = store;
    this.#client = client;
  }

  static async create<_T extends Streameable<GenericRecord>>(
    client: Client,
    bucketName: string,
  ) {
    const namespace = client.opts?.getNamespace();
    const storeName = namespace?.streamName(bucketName) ?? bucketName;
    const store = await client.getOrCreateKvStore(storeName, { history: 1 });
    return new Stream(storeName, store, client);
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

  async subscribe<S extends Subject>(subject: S) {
    const kvOpts = { key: subject.parse() } as KvWatchOptions;
    return this.#store.watch(kvOpts);
  }

  async subscribeConsumer(userConfig: Partial<SubscribeConsumerConfig>) {
    const config = this.extendConsumerConfig(userConfig);
    const consumer = await this.createConsumer(config);
    return this.#client.getJetstream().consumers.get(consumer.name);
  }

  private extendConsumerConfig(userConfig: Partial<SubscribeConsumerConfig>) {
    return {
      filter_subjects: userConfig.filterSubjects?.map((i) => i.parse()),
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
