import {
  type ConnectionOptions,
  usernamePasswordAuthenticator as connector,
} from '@nats-io/nats-core';

export enum DefaultProviderUrls {
  Testnet = 'nats://k8s-testnet-natstcp-83dfa2a526-321053ef001044cc.elb.us-east-1.amazonaws.com',
  Localnet = 'nats://127.0.0.1:4222',
}

export class NatsNamespace {
  static Fuel = 'fuel';
  private namespace: string;

  static default(): NatsNamespace {
    return new NatsNamespace(NatsNamespace.Fuel);
  }

  constructor(namespace?: string) {
    if (namespace) {
      this.namespace = namespace;
    } else {
      this.namespace = NatsNamespace.Fuel;
    }
  }

  subjectName(value: string): string {
    return `${this.namespace}.${value}`;
  }

  streamName(value: string): string {
    return `${this.namespace}_${value}`;
  }
}

export class ClientOpts {
  private url: string = DefaultProviderUrls.Testnet.toString();
  private timeoutSecs = 5;
  private namespace: NatsNamespace = NatsNamespace.default();

  constructor(url: DefaultProviderUrls | string) {
    this.url = url.toString();
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

  withCustomNamespace(namespace: string): ClientOpts {
    this.namespace = new NatsNamespace(namespace);
    return this;
  }

  withDefaultNamespace(): ClientOpts {
    this.namespace = new NatsNamespace();
    return this;
  }

  getNamespace(): NatsNamespace {
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
