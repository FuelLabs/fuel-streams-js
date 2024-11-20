/**
 * @file natsClient.ts
 * @description This file contains the implementation of the NATS client for the Fuel Streams package.
 * It provides functionality for connecting to NATS servers, managing JetStream, and handling key-value stores.
 * @module fuel-streams/client
 */

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
import { ClientStatus } from '../constants';
import type { ClientOpts } from './clientOpts';

/**
 * Callback function type for status stream updates
 * @callback StatusStreamCallback
 * @param {ClientStatus} status - The current client status
 * @returns
 */
export type StatusStreamCallback = (status: ClientStatus) => void;
export { ClientStatus };

/**
 * Maps NATS events to ClientStatus
 * @param {Events | DebugEvents} status - The NATS event
 * @returns The corresponding ClientStatus
 */
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

  /** @property {Client | undefined} instance - The singleton instance */
  private static instance?: Client;

  private constructor() {}

  /**
   * Creates and connects a new Client instance, or returns existing instance
   * @param {ClientOpts} opts - The client options
   * @returns A promise that resolves to the connected Client instance
   */
  static async connect(opts: ClientOpts) {
    if (!Client.instance) {
      Client.instance = new Client();
      await Client.instance.start(opts);
    }
    return Client.instance;
  }

  /**
   * Gets the current instance of the Client
   * @returns The Client instance
   * @throws {Error} If client is not initialized
   */
  static getInstance(): Client {
    if (!Client.instance) {
      throw new Error('Client not initialized. Call connect() first.');
    }
    return Client.instance;
  }

  /**
   * @inheritdoc
   */
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

  /**
   * Checks if the connection is closing
   * @returns True if the connection is closing, false otherwise
   */
  isConnectionClosing() {
    return (
      !this.natsConnection ||
      this.natsConnection.isClosed() ||
      this.natsConnection.isDraining()
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
