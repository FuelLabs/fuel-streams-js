import 'dotenv/config';
import {
  type JetStreamClient,
  type JetStreamManager,
  type JetStreamManagerOptions,
  jetstream,
  jetstreamManager,
} from '@nats-io/jetstream';
import { type KV, type KvOptions, Kvm } from '@nats-io/kv';
import { DebugEvents, Events, type NatsConnection } from '@nats-io/nats-core';
import { connect } from '@nats-io/transport-node';
import type { ClientOpts } from './clientOpts';

export type StatusStreamCallback = (status: ClientStatus) => void;

export enum ClientStatus {
  Connected = 0,
  Disconnected = 1,
  Reconnecting = 2,
  Disconnecting = 3,
  Errored = 4,
  Stale = 5,
}

const mapEventStatus = (status: Events | DebugEvents): ClientStatus => {
  switch (status) {
    case Events.Disconnect:
      return ClientStatus.Disconnected;
    case Events.Reconnect:
      return ClientStatus.Connected;
    case Events.Error:
      return ClientStatus.Errored;
    case DebugEvents.Reconnecting:
      return ClientStatus.Reconnecting;
    case DebugEvents.ClientInitiatedReconnect:
      return ClientStatus.Reconnecting;
    case DebugEvents.StaleConnection:
      return ClientStatus.Stale;
    default:
      return ClientStatus.Connected;
  }
};

interface NatsClient {
  connect(opts: ClientOpts): Promise<void>;
  getClientOpts(): ClientOpts;
  closeSafely(): Promise<boolean>;
  getStatusSteam(callback: StatusStreamCallback): void;
  getOrCreateKvStore(storeName: string, opts: Partial<KvOptions>): Promise<KV>;
}

export class Client implements NatsClient {
  opts?: ClientOpts;
  private natsConnection?: NatsConnection;
  private jetstreamManager?: JetStreamManager;
  private jetstream?: JetStreamClient;
  private kvm?: Kvm;

  async connect(opts: ClientOpts): Promise<void> {
    const nc = await connect(opts.connectOpts());
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
    if (this.isConnectionClosing()) {
      return true;
    }
    await this.natsConnection.drain();
    return this.natsConnection.isClosed();
  }

  isConnectionClosing() {
    return (
      this.natsConnection?.isClosed() ||
      this.natsConnection?.isDraining() ||
      false
    );
  }

  getStatusSteam(callback: StatusStreamCallback) {
    if (!this.natsConnection) {
      throw new Error('Client options are not set.');
    }

    // start async status loop firing the callback on each new status
    if (this.natsConnection && !this.isConnectionClosing()) {
      const statusStream = this.natsConnection?.status();
      (async () => {
        for await (const s of statusStream) {
          callback(mapEventStatus(s.type));
        }
      })().then();
    }
  }

  async getOrCreateKvStore(storeName: string, opts: Partial<KvOptions>) {
    if (!this.kvm) {
      throw new Error('Kvm client is not set.');
    }
    // open or create the kv store
    return this.kvm?.create(storeName, opts);
  }
}
