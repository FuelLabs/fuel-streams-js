import {
  type ConnectionOptions,
  usernamePasswordAuthenticator as connector,
} from '@nats-io/nats-core';
import { DefaultProviderUrls } from '../constants';

/**
 * Represents a namespace for NATS subjects and streams.
 *
 * @remarks
 * This class is used to manage namespaces for NATS subjects and streams,
 * providing methods to generate subject and stream names with the namespace prefix.
 */
export class NatsNamespace {
  /** Default namespace for Fuel-related subjects and streams. */
  static Fuel = 'fuel';
  private namespace: string;

  /**
   * Creates a default NatsNamespace instance.
   *
   * @returns A new {@link NatsNamespace} instance with the default Fuel namespace.
   */
  static default() {
    return new NatsNamespace(NatsNamespace.Fuel);
  }

  /**
   * Creates a new NatsNamespace instance.
   *
   * @param namespace - The namespace to use. If not provided, defaults to 'fuel'.
   */
  constructor(namespace?: string) {
    if (namespace) {
      this.namespace = namespace;
    } else {
      this.namespace = NatsNamespace.Fuel;
    }
  }

  /**
   * Generates a subject name with the current namespace.
   *
   * @param value - The subject name to append to the namespace.
   * @returns The full subject name including the namespace.
   */
  subjectName(value: string) {
    return `${this.namespace}.${value}`;
  }

  /**
   * Generates a stream name with the current namespace.
   *
   * @param value - The stream name to append to the namespace.
   * @returns The full stream name including the namespace.
   */
  streamName(value: string) {
    return `${this.namespace}_${value}`;
  }
}

/**
 * Represents the client options for connecting to a NATS server.
 *
 * @remarks
 * This class provides methods to configure and retrieve connection options
 * for a NATS client, including URL, timeout, and namespace settings.
 */
export class ClientOpts {
  private url = DefaultProviderUrls.testnet;
  private timeoutSecs = 5;
  private namespace = NatsNamespace.default();

  /**
   * Creates a new ClientOpts instance.
   *
   * @param url - The key of the default provider URL to use.
   */
  constructor(url: keyof typeof DefaultProviderUrls) {
    this.url = DefaultProviderUrls[url];
  }

  /**
   * Gets the provider URL.
   *
   * @returns The current provider URL.
   */
  getProviderUrl() {
    return this.url;
  }

  /**
   * Gets the timeout in seconds.
   *
   * @returns The current timeout in seconds.
   */
  getTimeoutSecs() {
    return this.timeoutSecs;
  }

  /**
   * Generates a unique connection ID.
   *
   * @returns A unique connection ID.
   */
  static connId() {
    return `connection-${ClientOpts.randomInt()}`;
  }

  /**
   * Generates a random integer between 0 and 999999.
   *
   * @returns A random integer.
   */
  static randomInt() {
    return Math.floor(Math.random() * 1000000);
  }

  /**
   * Sets a custom namespace for the client options.
   *
   * @param namespace - The custom namespace to set.
   * @returns The current {@link ClientOpts} instance for chaining.
   */
  withCustomNamespace(namespace: string) {
    this.namespace = new NatsNamespace(namespace);
    return this;
  }

  /**
   * Sets the default namespace for the client options.
   *
   * @returns The current {@link ClientOpts} instance for chaining.
   */
  withDefaultNamespace() {
    this.namespace = new NatsNamespace();
    return this;
  }

  /**
   * Gets the current namespace.
   *
   * @returns The current {@link NatsNamespace} instance.
   */
  getNamespace() {
    return this.namespace;
  }

  /**
   * Generates the connection options for the NATS client.
   *
   * @returns The connection options for the NATS client.
   */
  connectOpts() {
    const username = 'public';
    const password = 'temp-public-pass';
    const authenticator = connector(username, password);
    return {
      servers: this.url,
      timeout: this.timeoutSecs * 1000,
      authenticator,
      maxReconnectAttempts: 3,
    } as ConnectionOptions;
  }
}
