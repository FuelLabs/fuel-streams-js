import 'dotenv/config';
import chalk from 'chalk';
import { ClientOpts, DefaultProviderUrls, NatsClient } from '../../src/index';
const path = require('node:path');

require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env'),
});

(async () => {
  const header = '='.repeat(process.stdout.columns - 1);
  console.log(header);
  console.log(`${chalk.green.bold('Client Example')}`);
  console.log(header);

  try {
    // initialize a default client with all default settings
    let opts = ClientOpts.defaultOpts(DefaultProviderUrls.Localnet);
    let client = new NatsClient();
    await client.connect(opts);
    await client.closeSafely();

    // initialize a default client with some user options
    opts = ClientOpts.defaultOpts(DefaultProviderUrls.Localnet)
      .withCustomNamespace('fuel')
      .withTimeout(5);
    client = new NatsClient();
    await client.connect(opts);
    await client.closeSafely();

    // initialize an admin client with admin settings
    opts = ClientOpts.adminOpts(DefaultProviderUrls.Localnet)
      .withCustomNamespace('fuel')
      .withTimeout(5);
    client = new NatsClient();
    await client.connect(opts);
    await client.closeSafely();

    process.exit(0);
  } catch (ex) {
    console.error(ex);
    const msg = chalk.red(`Error = ${ex}`);
    console.error(msg);
    process.exit(-1);
  }
})();
