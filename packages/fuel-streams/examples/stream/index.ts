import 'dotenv/config';
import chalk from 'chalk';
import {
  ClientOpts,
  DefaultProviderUrls,
  NatsClient,
  Stream,
  StreamedBlock,
} from '../../src/index';
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

    const blocksStream = await Stream.getOrInit(
      client,
      StreamedBlock.prototype,
    );
    const _streamName = await blocksStream.getStreamName();

    await blocksStream.flushAwait();

    process.exit(0);
  } catch (ex) {
    console.error(ex);
    const msg = chalk.red(`Error = ${ex}`);
    console.error(msg);
    process.exit(-1);
  }
})();
