import path from 'node:path';
import chalk from 'chalk';
import { config } from 'dotenv';
import {
  BlockStream,
  BlocksSubject,
  ClientOpts,
  DefaultProviderUrls,
  NatsClient,
} from '../../src/index';

config({
  path: path.resolve(__dirname, '..', '.env'),
});

(async () => {
  const header = '='.repeat(process.stdout.columns - 1);
  console.log(header);
  console.log(`${chalk.green.bold('Streams Example')}`);
  console.log(header);

  if (!process.env.NATS_ADMIN_PASS) {
    console.error(
      chalk.red(
        'Error: NATS_ADMIN_PASS environment variable not set. Please set the NATS_ADMIN_PASS environment variable and try again.',
      ),
    );
    process.exit(-1);
  }

  try {
    // initialize a default client with all default settings
    const opts = new ClientOpts(DefaultProviderUrls.Testnet);
    const client = new NatsClient();
    await client.connect(opts);

    const stream = await BlockStream.init(client);
    const subscription = stream.subscribe(BlocksSubject.wildcard());

    for await (const msg of await subscription) {
      console.log('Received message', msg.key);
    }

    await stream.flushAwait();

    process.exit(0);
  } catch (ex) {
    console.error(ex);
    const msg = chalk.red(`Error = ${ex}`);
    console.error(msg);
    process.exit(-1);
  }
})();