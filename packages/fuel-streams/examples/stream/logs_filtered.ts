import chalk from 'chalk';
import { Client, ClientOpts, LogStream, LogsSubject } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Filtered Log Streams Example');

  const opts = new ClientOpts();
  const client = await Client.connect(opts);
  const stream = await LogStream.init(client);

  // Create a filtered subject
  const filteredSubject = new LogsSubject()
    .withBlockHeight(1000) // Filter for logs from block height 1000 and above
    .withTxId('0x1234567890abcdef1234567890abcdef1234567890abcdef'); // Replace with an actual transaction ID if known

  const consumer = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
  });

  const iter = await consumer.consume({ max_messages: 10 });
  for await (const msg of iter) {
    console.log(chalk.blue(`Received filtered log message: ${msg.subject}`));
    // Here you could add more processing of the filtered log message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('filtered log'));
