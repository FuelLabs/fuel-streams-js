import chalk from 'chalk';
import { BlocksStream, BlocksSubject, Client } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Filtered Block Streams Example');

  const client = await Client.connect({ network: 'testnet' });
  const stream = await BlocksStream.init(client);

  // Create a filtered subject using build
  const filteredSubject = BlocksSubject.build();
  const consumer = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
  });

  const iter = await consumer.consume();
  for await (const msg of iter) {
    console.log(chalk.blue(`Received filtered block message: ${msg.subject}`));
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('filtered block'));
