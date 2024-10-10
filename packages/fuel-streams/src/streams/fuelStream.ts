import type { Consumer } from '@nats-io/jetstream';
import type { KvEntry } from '@nats-io/kv';
import type { QueuedIterator } from '@nats-io/nats-core';
import type { NatsClient } from '../client/natsClient';
import {
  Stream,
  type Streameable,
  type SubscribeConsumerConfig,
} from './stream';

export class FuelStream<_S extends Streameable<_S>> {
  private static stream: Stream<unknown>;
  private filterSubjects: Array<string> = [];

  private constructor() {}

  public static async getOrInit<S>(
    client: NatsClient,
    streamable: S,
  ): Promise<Stream<S>> {
    FuelStream.stream = await Stream.getOrInit<S>(
      client,
      streamable as Streameable<S>,
    );
    return FuelStream.stream as Stream<S>;
  }

  public async subscribe(wildcard: string): Promise<QueuedIterator<KvEntry>> {
    const subscription = await FuelStream.stream?.subscribe(wildcard);
    return subscription;
  }

  public async subscribeWithConfig(
    userConfig: Partial<SubscribeConsumerConfig>,
  ): Promise<Consumer> {
    return await FuelStream.stream?.subscribeConsumer(userConfig);
  }

  public withFilter(filter: Array<string>) {
    this.filterSubjects.push(...filter);
  }

  public getStream<T>(): Stream<T> {
    return FuelStream.stream as Stream<T>;
  }
}
