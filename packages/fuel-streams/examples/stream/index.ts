import 'dotenv/config';
import chalk from 'chalk';
import {
  ClientOpts,
  DefaultProviderUrls,
  NatsClient,
  StreamedBlock,
} from '../../src/index';
import { FuelStream } from '../../src/streams/fuelStream';
const path = require('node:path');

require('dotenv').config({
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
    const opts = ClientOpts.adminOpts(DefaultProviderUrls.Localnet);
    const client = new NatsClient();
    await client.connect(opts);

    const blocksStream = await FuelStream.getOrInit(
      client,
      StreamedBlock.prototype,
    );
    const streamName = await blocksStream.getStreamName();
    console.log('Stream name', streamName);
    const subscription = blocksStream.subscribe(
      StreamedBlock.prototype.WILDCARD_LIST[0],
    );

    for await (const msg of await subscription) {
      console.log('Received message', msg);
    }

    await blocksStream.flushAwait();

    process.exit(0);
  } catch (ex) {
    console.error(ex);
    const msg = chalk.red(`Error = ${ex}`);
    console.error(msg);
    process.exit(-1);
  }
})();
