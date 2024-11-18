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
