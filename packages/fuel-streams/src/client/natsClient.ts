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

export type StatusStreamCallback = (status: NatsClientStatus) => void;

export enum NatsClientStatus {
  Connected = 0,
  Disconnected = 1,
  Reconnecting = 2,
  Disconnecting = 3,
  Errored = 4,
  Stale = 5,
}

const mapEventStatus = (status: Events | DebugEvents): NatsClientStatus => {
  switch (status) {
    case Events.Disconnect:
      return NatsClientStatus.Disconnected;
    case Events.Reconnect:
      return NatsClientStatus.Connected;
    case Events.Error:
      return NatsClientStatus.Errored;
    case DebugEvents.Reconnecting:
      return NatsClientStatus.Reconnecting;
    case DebugEvents.ClientInitiatedReconnect:
      return NatsClientStatus.Reconnecting;
    case DebugEvents.StaleConnection:
      return NatsClientStatus.Stale;
    default:
      return NatsClientStatus.Connected;
  }
};

export interface INatsClient {
  connect(opts: ClientOpts): Promise<void>;
  getClientOpts(): ClientOpts;
  closeSafely(): Promise<boolean>;
  getStatusSteam(callback: StatusStreamCallback): void;
  getOrCreateKvStore(storeName: string, opts: Partial<KvOptions>): Promise<KV>;
}

export class NatsClient implements INatsClient {
  private opts?: ClientOpts;
  private natsConnection?: NatsConnection;
  private jetstreamManager?: JetStreamManager;
  private jetstream?: JetStreamClient;
  private kvm?: Kvm;

  public async connect(opts: ClientOpts): Promise<void> {
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

  public getNatsConnection(): NatsConnection {
    return this.natsConnection as NatsConnection;
  }

  public getJetstream(): JetStreamClient {
    return this.jetstream as JetStreamClient;
  }

  public getJetstreamManager(): JetStreamManager {
    return this.jetstreamManager as JetStreamManager;
  }

  public getClientOpts(): ClientOpts {
    if (!this.opts) {
      throw new Error('Client options are not set.');
    }
    return this.opts;
  }

  public async closeSafely(): Promise<boolean> {
    if (!this.natsConnection) {
      throw new Error('Nats client is not set.');
    }
    if (this.isConnectionClosing()) {
      return true;
    }
    await this.natsConnection.drain();
    return this.natsConnection.isClosed();
  }

  isConnectionClosing(): boolean {
    return (
      this.natsConnection?.isClosed() ||
      this.natsConnection?.isDraining() ||
      false
    );
  }

  public getStatusSteam(callback: StatusStreamCallback): void {
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

  public async getOrCreateKvStore(
    storeName: string,
    opts: Partial<KvOptions>,
  ): Promise<KV> {
    if (!this.kvm) {
      throw new Error('Kvm client is not set.');
    }
    // open or create the kv store
    const kvStore = await this.kvm?.create(storeName, opts);
    return kvStore;
  }
}
