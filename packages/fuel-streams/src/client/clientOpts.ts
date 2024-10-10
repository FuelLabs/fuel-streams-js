import {
  type ConnectionOptions,
  usernamePasswordAuthenticator,
} from '@nats-io/nats-core';

export enum DefaultProviderUrls {
  Testnet = 'nats:://fuel-streaming.testnet:4222',
  Localnet = 'nats://127.0.0.1:4222',
}

export enum NatsUserRole {
  Admin = 'Admin',
  Default = 'Default',
}

export class NatsNamespace {
  static Fuel = 'fuel';
  private namespace: string;

  public static default(): NatsNamespace {
    return new NatsNamespace(NatsNamespace.Fuel);
  }

  constructor(namespace?: string) {
    if (namespace) {
      this.namespace = namespace;
    } else {
      this.namespace = NatsNamespace.Fuel;
    }
  }

  public subjectName(value: string): string {
    return `${this.namespace}.${value}`;
  }

  public streamName(value: string): string {
    return `${this.namespace}_${value}`;
  }
}

export class ClientOpts {
  private url: string = DefaultProviderUrls.Testnet.toString();
  private timeoutSecs = 5;
  private role: NatsUserRole = NatsUserRole.Default;
  private namespace: NatsNamespace = NatsNamespace.default();

  constructor(url: DefaultProviderUrls | string) {
    this.url = url.toString();
  }

  static defaultOpts(url: string): ClientOpts {
    return new ClientOpts(url).withRole(NatsUserRole.Default);
  }

  static adminOpts(url: string): ClientOpts {
    return new ClientOpts(url).withRole(NatsUserRole.Admin);
  }

  public withRole(role: NatsUserRole): ClientOpts {
    this.role = role;
    return this;
  }

  public withCustomNamespace(namespace: string): ClientOpts {
    this.namespace = new NatsNamespace(namespace);
    return this;
  }

  public withDefaultNamespace(): ClientOpts {
    this.namespace = new NatsNamespace();
    return this;
  }

  public withTimeout(secs: number): ClientOpts {
    this.timeoutSecs = secs;
    return this;
  }

  public getProviderUrl(): string {
    return this.url;
  }

  public getTimeoutSecs(): number {
    return this.timeoutSecs;
  }

  public getRole(): NatsUserRole {
    return this.role;
  }

  public getNamespace(): NatsNamespace {
    return this.namespace;
  }

  static connId(): string {
    return `connection-${ClientOpts.randomInt()}`;
  }

  static randomInt(): number {
    return Math.floor(Math.random() * 1000000);
  }

  public connectOpts(): ConnectionOptions {
    switch (this.role) {
      case NatsUserRole.Admin: {
        const username = 'admin';
        const natsAdminPass = process.env.NATS_ADMIN_PASS;
        if (!natsAdminPass) {
          throw new Error('Missing NATS_ADMIN_PASS env variable');
        }
        const authenticator = usernamePasswordAuthenticator(
          username,
          natsAdminPass,
        );
        return {
          servers: this.url,
          timeout: this.timeoutSecs * 1000,
          authenticator,
          maxReconnectAttempts: 3,
        } as ConnectionOptions;
      }
      case NatsUserRole.Default: {
        const username = 'default_user';
        const natsDefaultUserPassword = '';
        const authenticator = usernamePasswordAuthenticator(
          username,
          natsDefaultUserPassword,
        );
        return {
          servers: this.url,
          timeout: this.timeoutSecs * 1000,
          authenticator,
          maxReconnectAttempts: 3,
        } as ConnectionOptions;
      }
      default: {
        throw new Error('Unknown role');
      }
    }
  }
}
