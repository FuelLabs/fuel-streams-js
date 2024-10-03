/* eslint-disable @typescript-eslint/no-var-requires */
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

    await client.closeSafely();

    process.exit(0);
  } catch (ex) {
    console.error(ex);
    const msg = chalk.red(`Error = ${ex}`);
    console.error(msg);
    process.exit(-1);
  }
})();
