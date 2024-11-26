import chalk from 'chalk';
import { Client, LogsStream, LogsSubject } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Log Streams Example');

  const client = await Client.connect({ network: 'testnet' });
  const stream = await LogsStream.init(client);
  const subscription = await stream.subscribe(LogsSubject.build());

  for await (const msg of subscription) {
    console.log(chalk.blue(`Received log message: ${msg.subject}`));
    // Here you could add more processing of the log message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('log'));
