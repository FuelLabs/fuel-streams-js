import {
  type ConnectionOptions,
  usernamePasswordAuthenticator as connector,
} from '@nats-io/nats-core';

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
  private timeoutSecs = 5;
  private namespace = NatsNamespace.default();

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
    const username = 'default_user';
    const password = '';
    const authenticator = connector(username, password);
    return {
      servers: this.url,
      timeout: this.timeoutSecs * 1000,
      authenticator,
      maxReconnectAttempts: 0,
      reconnect: false,
    } as ConnectionOptions;
  }

  get url() {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        'Warning: Using insecure WebSocket connection. This is not recommended for production.',
      );
    }
    return 'wss://stream-testnet.fuel.network:8443';
  }
}
