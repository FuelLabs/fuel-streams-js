import path from 'node:path';
import chalk from 'chalk';
import { config } from 'dotenv';
import { Client, ClientOpts, DefaultProviderUrls } from '../../src/index';

config({
  path: path.resolve(__dirname, '..', '.env'),
});

(async () => {
  const header = '='.repeat(process.stdout.columns - 1);
  console.log(header);
  console.log(`${chalk.green.bold('Client Example')}`);
  console.log(header);

  try {
    // initialize a default client with all default settings
    const opts = new ClientOpts(DefaultProviderUrls.Testnet);
    const client = await Client.connect(opts);
    await client.closeSafely();

    process.exit(0);
  } catch (ex) {
    console.error(ex);
    const msg = chalk.red(`Error = ${ex}`);
    console.error(msg);
    process.exit(-1);
  }
})();
