import {
  type JetStreamClient,
  type JetStreamManager,
  type JetStreamManagerOptions,
  jetstream,
  jetstreamManager,
} from '@nats-io/jetstream';
import { type KV, type KvOptions, Kvm } from '@nats-io/kv';
import type { NatsConnection, Status } from '@nats-io/nats-core';
import { wsconnect } from '@nats-io/transport-node';
import type { ClientOpts } from './client-opts';
import { ClientStatus } from './constants';

export type StatusStreamCallback = (status: ClientStatus) => void;
export { ClientStatus };

const mapEventStatus = (status: Status['type']) => {
  switch (status) {
    case 'disconnect':
      return ClientStatus.Disconnected;
    case 'reconnect':
      return ClientStatus.Connected;
    case 'error':
      return ClientStatus.Errored;
    case 'reconnecting':
      return ClientStatus.Reconnecting;
    case 'forceReconnect':
      return ClientStatus.Reconnecting;
    case 'staleConnection':
      return ClientStatus.Stale;
    default:
      return ClientStatus.Connected;
  }
};

interface NatsClient {
  start(opts: ClientOpts): Promise<void>;
  getClientOpts(): ClientOpts;
  closeSafely(): Promise<boolean>;
  getStatusStream(callback: StatusStreamCallback): () => void;
  getOrCreateKvStore(storeName: string, opts: Partial<KvOptions>): Promise<KV>;
}

export class Client implements NatsClient {
  opts?: ClientOpts;
  private natsConnection?: NatsConnection;
  private jetstreamManager?: JetStreamManager;
  private jetstream?: JetStreamClient;
  private kvm?: Kvm;
  private static instance?: Client;
  private constructor() {}

  static async connect(opts: ClientOpts) {
    if (!Client.instance) {
      Client.instance = new Client();
      await Client.instance.start(opts);
    }
    return Client.instance;
  }

  static getInstance(): Client {
    if (!Client.instance) {
      throw new Error('Client not initialized. Call connect() first.');
    }
    return Client.instance;
  }

  async start(opts: ClientOpts) {
    const nc = await wsconnect(opts.connectOpts());
    console.info(`Successfully connected to ${nc.getServer()} !`);
    this.jetstreamManager = await jetstreamManager(nc);
    this.jetstream = jetstream(nc, {
      timeout: 10_000,
    } as JetStreamManagerOptions);
    this.kvm = new Kvm(this.jetstream);
    this.natsConnection = nc;
    this.opts = opts;
  }

  getNatsConnection() {
    return this.natsConnection as NatsConnection;
  }

  getJetstream() {
    return this.jetstream as JetStreamClient;
  }

  getJetstreamManager() {
    return this.jetstreamManager as JetStreamManager;
  }

  getClientOpts() {
    if (!this.opts) {
      throw new Error('Client options are not set.');
    }
    return this.opts;
  }

  async closeSafely() {
    if (!this.natsConnection) {
      throw new Error('Nats client is not set.');
    }

    try {
      if (this.isConnectionClosing()) {
        return true;
      }

      await this.natsConnection.drain();
      await this.natsConnection.close();
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return true;
    } catch (error) {
      console.error('Error while closing NATS connection:', error);
      // Force close if graceful shutdown fails
      if (this.natsConnection && !this.natsConnection.isClosed()) {
        await this.natsConnection.close();
      }
      return false;
    }
  }

  isConnectionClosing() {
    return (
      !this.natsConnection ||
      this.natsConnection.isClosed() ||
      this.natsConnection.isDraining()
    );
  }

  getStatusStream(callback: StatusStreamCallback): () => void {
    if (!this.natsConnection) {
      throw new Error(
        'Cannot get status stream: NATS connection not initialized',
      );
    }

    const statusStream = this.natsConnection.status();
    console.log(statusStream);
    const controller = new AbortController();

    // Start monitoring status changes
    (async () => {
      try {
        for await (const status of statusStream) {
          if (controller.signal.aborted) break;
          callback(mapEventStatus(status.type));
        }
      } catch (error) {
        console.error('Status stream error:', error);
        callback(ClientStatus.Errored);
      }
    })();

    // Return cleanup function
    return () => controller.abort();
  }

  async getOrCreateKvStore(storeName: string, opts: Partial<KvOptions>) {
    if (!this.kvm) {
      throw new Error('Kvm client is not set.');
    }
    // open or create the kv store
    return this.kvm?.create(storeName, opts);
  }
}
