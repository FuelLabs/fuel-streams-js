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
    const username = 'admin';
    const password = 'admin';
    const authenticator = connector(username, password);
    return {
      servers: this.url,
      timeout: this.timeoutSecs * 1000,
      authenticator,
      maxReconnectAttempts: -1,
      reconnect: true,
      reconnectTimeWait: 2000,
      maxReconnectTimeWait: 10000,
      waitOnFirstConnect: true,
      pingInterval: 10000,
      maxPingOut: 3,
      noEcho: true,
    } as ConnectionOptions;
  }

  get url() {
    // const subdomain =
    //   this.network === Network.mainnet ? "stream" : "stream-testnet";
    return 'ws://k8s-fuelstre-fuelstre-d1a733c184-c10339d402ab28fd.elb.us-east-1.amazonaws.com:8443';
  }
}

function randomInt() {
  return Math.floor(Math.random() * 1000000);
}
