import chalk from 'chalk';
import { Client, ClientOpts, LogStream, LogsSubject } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Log Streams Example');

  const opts = new ClientOpts('testnet');
  const client = await Client.connect(opts);
  const stream = await LogStream.init(client);
  const subscription = await stream.subscribe(LogsSubject.all());

  for await (const msg of subscription) {
    console.log(chalk.blue(`Received log message: ${msg.key}`));
    // Here you could add more processing of the log message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('log'));
