import type { JetStreamClient, JetStreamManager } from '@nats-io/jetstream';
import { type KvOptions, Kvm } from '@nats-io/kv';
import type { NatsConnection, Status } from '@nats-io/nats-core';
import { wsconnect } from '@nats-io/transport-node';
import { ClientOpts, Network } from './client-opts';
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

type Opts = {
  network?: keyof typeof Network;
};

export class Client {
  opts?: ClientOpts;
  kvm!: Kvm;
  jetStreamManager!: JetStreamManager;
  jetStream!: JetStreamClient;
  private natsConnection?: NatsConnection;
  private static instance?: Client;
  private constructor() {}

  static async connect(opts: Opts = { network: 'mainnet' }) {
    if (!Client.instance) {
      Client.instance = new Client();
      await Client.instance.start(opts);
    }
    return Client.instance;
  }

  static getInstance() {
    if (!Client.instance) {
      throw new Error('Client not initialized. Call connect() first.');
    }
    return Client.instance;
  }

  async start(clientOpts: Opts) {
    const opts = new ClientOpts(Network[clientOpts.network ?? 'mainnet']);
    const nc = await wsconnect(opts.connectOpts());
    console.info(`Successfully connected to ${nc.getServer()} !`);

    this.kvm = new Kvm(nc);
    this.natsConnection = nc;
    this.opts = opts;
    this.jetStreamManager = await this.kvm.js.jetstreamManager();
    this.jetStream = this.jetStreamManager.jetstream();
  }

  getNatsConnection() {
    return this.natsConnection as NatsConnection;
  }

  getJetstream() {
    return this.jetStream;
  }

  getJetstreamManager() {
    return this.jetStreamManager;
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

  async getOrCreateKvStore(storeName: string, opts: Partial<KvOptions> = {}) {
    if (!this.kvm) {
      throw new Error('Kvm client is not set.');
    }
    return this.kvm?.create(storeName, opts);
  }
}
