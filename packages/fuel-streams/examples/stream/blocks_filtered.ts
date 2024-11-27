import chalk from 'chalk';
import { BlocksStream, BlocksSubject, Client } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Filtered Block Streams Example');

  const client = await Client.connect({ network: 'testnet' });
  const stream = await BlocksStream.init(client);

  // Create a filtered subject using build
  const filteredSubject = BlocksSubject.build();
  const subscription = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
  });

  for await (const data of subscription) {
    console.log(chalk.blue(`Received filtered block: ${data}`));
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('filtered block'));
