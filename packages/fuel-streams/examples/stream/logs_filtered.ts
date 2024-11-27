import chalk from 'chalk';
import { Client, LogsStream, LogsSubject } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Filtered Log Streams Example');

  const client = await Client.connect({ network: 'testnet' });
  const stream = await LogsStream.init(client);

  // Create a filtered subject using build
  const filteredSubject = LogsSubject.build({
    txId: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
  });

  const subscription = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
  });

  for await (const data of subscription) {
    console.log(chalk.blue(`Received filtered log: ${data}`));
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('filtered log'));
