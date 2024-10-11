import {
  type ConnectionOptions,
  usernamePasswordAuthenticator as connector,
} from '@nats-io/nats-core';
import { DefaultProviderUrls } from '../constants';

export class NatsNamespace {
  static Fuel = 'fuel';
  private namespace: string;

  static default() {
    return new NatsNamespace(NatsNamespace.Fuel);
  }

  constructor(namespace?: string) {
    if (namespace) {
      this.namespace = namespace;
    } else {
      this.namespace = NatsNamespace.Fuel;
    }
  }

  subjectName(value: string) {
    return `${this.namespace}.${value}`;
  }

  streamName(value: string) {
    return `${this.namespace}_${value}`;
  }
}

export class ClientOpts {
  private url = DefaultProviderUrls.testnet;
  private timeoutSecs = 5;
  private namespace = NatsNamespace.default();

  constructor(url: keyof typeof DefaultProviderUrls) {
    this.url = DefaultProviderUrls[url];
  }

  getProviderUrl() {
    return this.url;
  }

  getTimeoutSecs() {
    return this.timeoutSecs;
  }

  static connId() {
    return `connection-${ClientOpts.randomInt()}`;
  }

  static randomInt() {
    return Math.floor(Math.random() * 1000000);
  }

  withCustomNamespace(namespace: string) {
    this.namespace = new NatsNamespace(namespace);
    return this;
  }

  withDefaultNamespace() {
    this.namespace = new NatsNamespace();
    return this;
  }

  getNamespace() {
    return this.namespace;
  }

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
