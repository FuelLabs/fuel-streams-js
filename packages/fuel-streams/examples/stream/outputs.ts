import chalk from 'chalk';
import { Client, ClientOpts, OutputStream, OutputsSubject } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Output Streams Example');

  const opts = new ClientOpts('testnet');
  const client = await Client.connect(opts);
  const stream = await OutputStream.init(client);
  const subscription = await stream.subscribe(OutputsSubject.all());

  for await (const msg of subscription) {
    console.log(chalk.blue(`Received output message: ${msg.key}`));
    // Here you could add more processing of the output message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('output'));
