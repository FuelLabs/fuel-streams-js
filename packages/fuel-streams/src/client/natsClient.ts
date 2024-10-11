/**
 * @file natsClient.ts
 * @description This file contains the implementation of the NATS client for the Fuel Streams package.
 * It provides functionality for connecting to NATS servers, managing JetStream, and handling key-value stores.
 * @module fuel-streams/client
 */

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
import { ClientStatus } from '../constants';
import type { ClientOpts } from './clientOpts';

/**
 * Callback function type for status stream updates
 * @callback StatusStreamCallback
 * @param {ClientStatus} status - The current client status
 * @returns
 */
export type StatusStreamCallback = (status: ClientStatus) => void;

/**
 * Maps NATS events to ClientStatus
 * @param {Events | DebugEvents} status - The NATS event
 * @returns The corresponding ClientStatus
 */
const mapEventStatus = (status: Events | DebugEvents) => {
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

/**
 * Interface defining the methods for the NATS client
 * @interface
 */
interface NatsClient {
  /**
   * Starts the NATS client connection
   * @param {ClientOpts} opts - The client options
   * @returns
   */
  start(opts: ClientOpts): Promise<void>;

  /**
   * Gets the client options
   * @returns The client options
   * @throws {Error} If client options are not set
   */
  getClientOpts(): ClientOpts;

  /**
   * Safely closes the NATS connection
   * @returns A promise that resolves to true if the connection is closed
   * @throws {Error} If NATS client is not set
   */
  closeSafely(): Promise<boolean>;

  /**
   * Sets up a status stream and calls the callback for each status update
   * @param {StatusStreamCallback} callback - The callback function to handle status updates
   * @throws {Error} If client options are not set
   */
  getStatusSteam(callback: StatusStreamCallback): void;

  /**
   * Gets or creates a key-value store
   * @param {string} storeName - The name of the key-value store
   * @param {Partial<KvOptions>} opts - The options for the key-value store
   * @returns A promise that resolves to the key-value store
   * @throws {Error} If Kvm client is not set
   */
  getOrCreateKvStore(storeName: string, opts: Partial<KvOptions>): Promise<KV>;
}

/**
 * Implementation of the NATS client
 * @class
 * @implements {NatsClient}
 */
export class Client implements NatsClient {
  /** @property {ClientOpts | undefined} opts - The client options */
  opts?: ClientOpts;

  /** @property {NatsConnection | undefined} natsConnection - The NATS connection */
  private natsConnection?: NatsConnection;

  /** @property {JetStreamManager | undefined} jetstreamManager - The JetStream manager */
  private jetstreamManager?: JetStreamManager;

  /** @property {JetStreamClient | undefined} jetstream - The JetStream client */
  private jetstream?: JetStreamClient;

  /** @property {Kvm | undefined} kvm - The Key-Value manager */
  private kvm?: Kvm;

  private constructor() {}

  /**
   * Creates and connects a new Client instance
   * @param {ClientOpts} opts - The client options
   * @returns A promise that resolves to the connected Client instance
   */
  static async connect(opts: ClientOpts) {
    const client = new Client();
    await client.start(opts);
    return client;
  }

  /**
   * @inheritdoc
   */
  async start(opts: ClientOpts) {
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

  /**
   * Gets the NATS connection
   * @returns The NATS connection
   */
  getNatsConnection() {
    return this.natsConnection as NatsConnection;
  }

  /**
   * Gets the JetStream client
   * @returns The JetStream client
   */
  getJetstream() {
    return this.jetstream as JetStreamClient;
  }

  /**
   * Gets the JetStream manager
   * @returns The JetStream manager
   */
  getJetstreamManager() {
    return this.jetstreamManager as JetStreamManager;
  }

  /**
   * @inheritdoc
   */
  getClientOpts() {
    if (!this.opts) {
      throw new Error('Client options are not set.');
    }
    return this.opts;
  }

  /**
   * @inheritdoc
   */
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

  /**
   * Checks if the connection is closing
   * @returns True if the connection is closing, false otherwise
   */
  isConnectionClosing() {
    return (
      this.natsConnection?.isClosed() ||
      this.natsConnection?.isDraining() ||
      false
    );
  }

  /**
   * @inheritdoc
   */
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

  /**
   * @inheritdoc
   */
  async getOrCreateKvStore(storeName: string, opts: Partial<KvOptions>) {
    if (!this.kvm) {
      throw new Error('Kvm client is not set.');
    }
    // open or create the kv store
    return this.kvm?.create(storeName, opts);
  }
}
