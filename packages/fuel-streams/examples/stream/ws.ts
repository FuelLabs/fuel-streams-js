import {
  type ConnectionOptions,
  type SubscriptionOptions,
  wsconnect,
} from '@nats-io/transport-node';
import chalk from 'chalk';
import { handleUnhandledError, printHeader } from '../helpers';

globalThis.WebSocket = require('websocket').w3cwebsocket;

async function main() {
  printHeader('Websockets Example');

  // create a connection
  const nc = await wsconnect({
    servers: ['wss://stream-testnet.fuel.network:8080'],
    timeout: 10 * 1000,
    maxReconnectAttempts: 3,
  } as ConnectionOptions);

  console.info('Connected to Nats ws server');

  const WILDCARD = 'fuel_blocks.*.*';
  console.info(`Subscribing to ${WILDCARD} ...`);
  const subscription = await nc.subscribe(WILDCARD, {
    max: 10,
    timeout: 20000,
  } as SubscriptionOptions);

  console.info('Waiting for messages ...');
  for await (const msg of subscription) {
    console.log(chalk.blue(`Received message: ${msg}`));
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const data = msg.json() as any;
    console.log(data);
  }

  // close the connection
  nc.close();
}
main().catch(handleUnhandledError('block'));
