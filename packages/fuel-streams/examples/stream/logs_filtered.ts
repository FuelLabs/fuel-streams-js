import chalk from 'chalk';
import { Client, ClientOpts, LogsStream, LogsSubject } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Filtered Log Streams Example');

  const opts = new ClientOpts();
  const client = await Client.connect(opts);
  const stream = await LogsStream.init(client);

  // Create a filtered subject using build
  const filteredSubject = LogsSubject.build({
    txId: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
  });

  const consumer = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
  });

  const iter = await consumer.consume({ max_messages: 10 });
  for await (const msg of iter) {
    console.log(chalk.blue(`Received filtered log message: ${msg.subject}`));
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('filtered log'));
