import type { Client } from '../client/natsClient';
import {
  Stream,
  type Streameable,
  type SubscribeConsumerConfig,
} from './stream';

export class FuelStream<S extends Streameable<unknown>> {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private static instance: FuelStream<any>;
  #stream: Stream<S>;
  #filterSubjects: Array<string> = [];

  private constructor(readonly bucketName: string) {}

  public static get<S extends Streameable<unknown>>(
    name: string,
  ): FuelStream<S> {
    if (!FuelStream.instance) {
      FuelStream.instance = new FuelStream<S>(name);
    }
    return FuelStream.instance as FuelStream<S>;
  }

  async init(client: Client) {
    this.#stream = await Stream.create<S>(client, this.bucketName);
    return this.#stream;
  }

  async subscribe(wildcard: string) {
    const subscription = await this.#stream?.subscribe(wildcard);
    return subscription;
  }

  async subscribeWithConfig(config: Partial<SubscribeConsumerConfig>) {
    return await this.#stream?.subscribeConsumer(config);
  }

  withFilter(filter: Array<string>) {
    this.#filterSubjects.push(...filter);
  }

  getStream() {
    return this.#stream;
  }

  getStreamName() {
    return this.bucketName;
  }
}
