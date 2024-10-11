export enum StreamNames {
  Blocks = 'blocks',
  Transactions = 'transactions',
  Inputs = 'inputs',
  Outputs = 'outputs',
  Receipts = 'receipts',
  Logs = 'logs',
}

export enum ClientStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Reconnecting = 'reconnecting',
  Disconnecting = 'disconnecting',
  Errored = 'errored',
  Stale = 'stale',
}

export enum DefaultProviderUrls {
  testnet = 'nats://k8s-testnet-natstcp-83dfa2a526-321053ef001044cc.elb.us-east-1.amazonaws.com',
  localnet = 'nats://127.0.0.1:4222',
}
