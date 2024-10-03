import { StorageType } from '@nats-io/jetstream';
import type { KV, KvEntry, KvWatchOptions } from '@nats-io/kv';
import type { QueuedIterator } from '@nats-io/nats-core';
import type { NatsClient } from '../client/natsClient';
import type { StreamData } from './streamData';

export abstract class Streameable<T> {
  NAME: string;
  WILDCARD_LIST: string[];
  abstract encode(): Promise<Uint8Array>;
  abstract decode(encoded: Uint8Array): Promise<StreamData<T>>;
}

export class Stream<T> {
  private store: KV;
  private static instance: Stream<undefined> | null = null;

  private constructor(store: KV) {
    this.store = store;
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
    return new Stream<T>(store);
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

  public async subscribe(
    opts: KvWatchOptions,
  ): Promise<QueuedIterator<KvEntry>> {
    const subscription = await this.store.watch(opts);
    return subscription;
  }

  // public async getConsumersAndState(): Promise<{ consumers: string[], state: any }> {
  //     const consumers = await this.store.getConsumers();
  //     const state = await this.store.getState();
  //     return { consumers, state };
  // }

  public async getStreamName(): Promise<string> {
    return (await this.store.status()).streamInfo.config.name;
  }
}
