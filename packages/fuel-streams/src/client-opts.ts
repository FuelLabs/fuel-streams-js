import {
  type ConnectionOptions,
  usernamePasswordAuthenticator as connector,
} from '@nats-io/nats-core';

export enum Network {
  testnet = 'testnet',
  mainnet = 'mainnet',
}

export class ClientOpts {
  private timeoutSecs = 5;
  private namespace = 'fuel';

  constructor(private readonly network: Network) {}

  getProviderUrl() {
    return this.url;
  }

  getTimeoutSecs() {
    return this.timeoutSecs;
  }

  getNetwork() {
    return this.network;
  }

  static connId() {
    return `connection-${randomInt()}`;
  }

  static randomInt() {
    return Math.floor(Math.random() * 1000000);
  }

  subjectName(value: string) {
    return `${this.namespace}.${value}`;
  }

  streamName(value: string) {
    return `${this.namespace}_${value}`;
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
    const subdomain =
      this.network === Network.mainnet ? 'stream' : 'stream-testnet';
    return `wss://${subdomain}.fuel.network:8443`;
  }
}

function randomInt() {
  return Math.floor(Math.random() * 1000000);
}
